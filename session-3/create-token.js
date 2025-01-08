import { Connection, Keypair } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import * as fs from "fs";

async function createGameToken() {
  // Connect to Devnet
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  // Generate a new keypair for the mint authority
  const mintAuthority = Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    mintAuthority.publicKey,
    1000000000 // 1 SOL
  );
  await connection.confirmTransaction(airdropSignature);

  // Create the token mint
  const mint = await createMint(
    connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    9 // 9 decimals like SOL
  );

  // Save the mint authority's private key
  fs.writeFileSync(
    "mint-authority.json",
    JSON.stringify({
      privateKey: Array.from(mintAuthority.secretKey),
      publicKey: mintAuthority.publicKey.toString(),
      mintAddress: mint.toString(),
    })
  );
}

createGameToken().catch(console.error);
