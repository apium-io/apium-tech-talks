import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export class SolanaService {
  private connection: Connection;
  private payerKeypair: Keypair;

  constructor(rpcUrl: string, privateKey: string) {
    this.connection = new Connection(rpcUrl, "confirmed");
    this.payerKeypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(privateKey))
    );
  }

  async sendSOL(recipientAddress: string, amount: number): Promise<string> {
    try {
      const recipientPubKey = new PublicKey(recipientAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.payerKeypair.publicKey,
          toPubkey: recipientPubKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payerKeypair]
      );

      return signature;
    } catch (error) {
      console.error("Error sending SOL:", error);
      throw new Error("Failed to send SOL");
    }
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(
        this.payerKeypair.publicKey
      );
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting balance:", error);
      throw new Error("Failed to get balance");
    }
  }
}
