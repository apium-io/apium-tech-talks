import {
  claimSOL,
  createUser,
  getUserStatus,
  updateUserStatus,
} from "./services/controller";

export const lambdaHandler = async (event: any, context: any) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
  };

  try {
    if (event.httpMethod === "POST" && event.path === "/user") {
      if (!event.body) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Missing request body" }),
        };
      }

      const body = JSON.parse(event.body);

      if (!body.userId || !body.walletAddress) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Missing required fields: userId and walletAddress",
          }),
        };
      }

      const userData = {
        PK: body.userId,
        SK: body.walletAddress,
      };

      try {
        const result = await createUser(userData);
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify(result),
        };
      } catch (error) {
        console.error("Error in createUser:", error); // Add this log
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message: error.message,
          }),
        };
      }
    }

    if (
      event.httpMethod === "GET" &&
      event.resource === "/user/{userid}/status"
    ) {
      const userId = event.pathParameters?.userid;
      const walletAddress = event.queryStringParameters?.walletAddress;

      if (!userId || !walletAddress) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Missing required parameters: userId and walletAddress",
          }),
        };
      }


      try {
        const userStatus = await getUserStatus(userId, walletAddress);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(userStatus),
        };
      } catch (error) {
        if (error.message === "User not found") {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
              message: "User not found",
            }),
          };
        }
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Error retrieving user status",
            error: error.message,
          }),
        };
      }
    }

    if (
      event.httpMethod === "POST" &&
      event.resource === "/user/{userid}/status"
    ) {
      const userId = event.pathParameters?.userid;
      const body = JSON.parse(event.body);
      const { walletAddress, gameCoins } = body;

      if (!userId || !walletAddress || typeof gameCoins !== "number") {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message:
              "Missing or invalid required fields: userId, walletAddress, and gameCoins",
          }),
        };
      }

      try {
        const result = await updateUserStatus(userId, walletAddress, gameCoins);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result),
        };
      } catch (error) {
        console.error("Error updating user status:", error);

        if (error.message === "User not found") {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
              message: "User not found",
            }),
          };
        }

        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Error updating user status",
            error: error.message,
          }),
        };
      }
    }

    if (
      event.httpMethod === "POST" &&
      event.resource === "/user/{userid}/claim"
    ) {
      const userId = event.pathParameters?.userid;
      const body = JSON.parse(event.body);
      const { walletAddress } = body;

      if (!userId || !walletAddress) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            message:
              "Missing or invalid required fields: userId, walletAddress",
          }),
        };
      }

      try {
        const result = await claimSOL({
          userId: userId,
          walletAddress: walletAddress,
        });
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result),
        };
      } catch (error) {
        console.error("Error claiming tokens", error);

        if (error.message === "User not found") {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
              message: "User not found",
            }),
          };
        }

        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({
            message: "Error claiming tokens",
            error: error.message,
          }),
        };
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Not found",
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
