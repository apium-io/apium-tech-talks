import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ERROR_MESSAGES = {
  NOT_FOUND: "Can't find on this server!",
  INTERNAL_SERVER_ERROR: "Internal server error",
  DB_FETCH_FAILED: "Failed to fetch data from database",
  DB_SAVE_FAILED: "Failed to save data to database",
  DB_UPDATE_FAILED: "Failed to update data in database",
  DB_SCAN_FAILED: "Failed to scan data from database",
  VALIDATION_ERROR: "Validation error",
  UNAUTHORIZED: "Unauthorized",
  BAD_REQUEST: "Bad request",
  DB_BATCH_GET_FAILED: "Failed to get batch data from database",
  PRESIGNING_FAILED: "Failed to generate presigned URL",
  OBJECT_URL_FAILED: "Failed to generate object URL",
  CHALLENGE_NOT_FOUND: "Challenge not found",
  WALLET_NOT_FOUND: "Wallet not found",
  CHALLENGE_NOT_READY: "Challenge not ready",
};

export class DynamoDBService {
  private docClient: DynamoDBDocumentClient;
  private client: DynamoDBClient;
  constructor() {
    this.client = new DynamoDBClient({
      region: "eu-central-1",
    });
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  async writeData(params: any): Promise<boolean> {
    try {
      await this.docClient.send(new PutCommand(params));
      return true;
    } catch (error) {
      console.error(error);
      throw new Error(ERROR_MESSAGES.DB_SAVE_FAILED);
    }
  }

  async scanData(params: any): Promise<any[]> {
    try {
      const result = await this.docClient.send(new ScanCommand(params));
      return result.Items ? result.Items.map((item) => unmarshall(item)) : [];
    } catch (error) {
      console.error(error);
      throw new Error(ERROR_MESSAGES.DB_SCAN_FAILED);
    }
  }

  async fetchData(params: any): Promise<any> {
    try {
      const result = await this.docClient.send(new QueryCommand(params));
      return result.Items?.[0] || null;
    } catch (error) {
      console.error(error);
      throw new Error(ERROR_MESSAGES.DB_FETCH_FAILED);
    }
  }

  async updateData(params: any): Promise<any> {
    try {
      const result = await this.docClient.send(new UpdateCommand(params));
      return result.Attributes || null;
    } catch (error) {
      console.error(error);
      throw new Error(ERROR_MESSAGES.DB_UPDATE_FAILED);
    }
  }
}
