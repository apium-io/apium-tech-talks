// scripts/create-wallet.ts
import { Keypair } from "@solana/web3.js";
import * as fs from "fs";

const createWallet = () => {
  // Generate new keypair
  const keypair = Keypair.generate();

  // Get secret key and public key
  const secretKey = JSON.stringify(Array.from(keypair.secretKey));
  const publicKey = keypair.publicKey.toString();

  // Save to file
  const walletData = {
    publicKey,
    secretKey,
  };

  fs.writeFileSync("wallet-config.json", JSON.stringify(walletData, null, 2));
};

createWallet();
