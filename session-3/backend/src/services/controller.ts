import { UserData } from "./types";
import { DynamoDBService } from "./aws/dynamodb.service";
import { SolanaService } from "utils/solana";

interface ClaimRequest {
  userId: string;
  walletAddress: string;
}

export const createUser = async (userData: UserData) => {
  const TABLE_NAME = "clicker-game-data";
  if (!userData.PK || !userData.SK) {
    throw new Error("User Id and WalletAddress are required fields");
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: userData.PK,
      SK: userData.SK,
      gameCoins: 0,
      createdAt: new Date().toISOString(),
    },
  };

  const dynamoDBService = new DynamoDBService();
  try {
    const result = await dynamoDBService.writeData(params);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserStatus = async (userId: string, walletAddress: string) => {
  const TABLE_NAME = "clicker-game-data";

  if (!userId || !walletAddress) {
    throw new Error("User Id and WalletAddress are required fields");
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "#pk = :pkVal AND #sk = :skVal",
    ExpressionAttributeNames: {
      "#pk": "PK",
      "#sk": "SK",
    },
    ExpressionAttributeValues: {
      ":pkVal": userId,
      ":skVal": walletAddress,
    },
  };

  const dynamoDBService = new DynamoDBService();
  try {
    const result = await dynamoDBService.fetchData(params);
    if (!result) {
      throw new Error("User not found");
    }
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateUserStatus = async (
  userId: string,
  walletAddress: string,
  gameCoins: number
) => {
  const TABLE_NAME = "clicker-game-data";

  try {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: userId,
        SK: walletAddress,
      },
      UpdateExpression: "SET gameCoins = :gameCoins, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":gameCoins": gameCoins,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    };

    const dynamoDBService = new DynamoDBService();
    const result = await dynamoDBService.updateData(params);

    if (!result) {
      throw new Error("User not found");
    }

    return result;
  } catch (error) {
    console.error("Error updating user status:", error);
    if (error.message.includes("ConditionalCheckFailed")) {
      throw new Error("User not found");
    }
    throw error;
  }
};

export const claimSOL = async (request: ClaimRequest) => {
  const REQUIRED_COINS = 30;
  const SOL_REWARD = 0.01;
  const TABLE_NAME = "clicker-game-data";

  const dynamoDBService = new DynamoDBService();

  const solanaService = new SolanaService(
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
    process.env.PAYER_PRIVATE_KEY!
  );

  try {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "#pk = :pkVal AND #sk = :skVal",
      ExpressionAttributeNames: {
        "#pk": "PK",
        "#sk": "SK",
      },
      ExpressionAttributeValues: {
        ":pkVal": request.userId,
        ":skVal": request.walletAddress,
      },
    };

    const userData = await dynamoDBService.fetchData(params);

    if (!userData) {
      throw new Error("User not found");
    }

    const currentGameCoins = userData.gameCoins || 0;

    if (currentGameCoins < REQUIRED_COINS) {
      throw new Error("Insufficient coins");
    }

    const payerBalance = await solanaService.getBalance();
    if (payerBalance < SOL_REWARD) {
      throw new Error("Insufficient funds in payer wallet");
    }

    const signature = await solanaService.sendSOL(
      request.walletAddress,
      SOL_REWARD
    );

    const updateParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: request.userId,
        SK: request.walletAddress,
      },
      UpdateExpression: "set gameCoins = :newBalance, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":newBalance": currentGameCoins - REQUIRED_COINS,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    };

    await dynamoDBService.updateData(updateParams);

    return {
      success: true,
      signature,
      newBalance: currentGameCoins - REQUIRED_COINS,
    };
  } catch (error: any) {
    console.error("Error processing claim:", error);
    throw new Error(error.message || "Failed to process claim");
  }
};
