import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ParticleProvider } from "@particle-network/provider";
import { createMintToInstruction } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";

const CONVERSION_RATE = {
  GAME_TOKENS: 30, // game tokens needed
  SOL_AMOUNT: 0.001, // SOL to receive
};

interface Monster {
  health: number;
  maxHealth: number;
  type: "goblin" | "golem" | "wizard" | "darkKnight" | "darkDragon";
  reward: number;
}

const monsterTypes = [
  {
    type: "goblin",
    name: "Goblin",
    minHealth: 30,
    maxHealth: 60,
    reward: 3,
    image: "/goblin.png",
  },
  {
    type: "golem",
    name: "Golem",
    minHealth: 61,
    maxHealth: 75,
    reward: 5,
    image: "/golem.png",
  },
  {
    type: "wizard",
    name: "Wizard",
    minHealth: 76,
    maxHealth: 85,
    reward: 7,
    image: "/wizard.png",
  },
  {
    type: "darkKnight",
    name: "Dark Knight",
    minHealth: 86,
    maxHealth: 95,
    reward: 10,
    image: "/darkKnight.png",
  },
  {
    type: "darkDragon",
    name: "Dark Dragon",
    minHealth: 96,
    maxHealth: 100,
    reward: 15,
    image: "/darkDragon.png",
  },
];

const connection = new Connection("https://api.devnet.solana.com");

// Your token mint address (you'll need to create this first)
const GAME_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_GAME_TOKEN_MINT || ""
);

// Create a Keypair from the private key
const DISTRIBUTOR_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(process.env.NEXT_PUBLIC_DISTRIBUTOR_PRIVATE_KEY || "[]")
  )
);

const MiniGame: React.FC = () => {
  const [energy, setEnergy] = useState(30);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);

  // Initialize Particle provider with auth
  const particle = new ParticleProvider(window.particle!.auth);

  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prevEnergy) => Math.min(prevEnergy + 1, 30));
    }, 3000);

    if (!monster) {
      generateMonster();
    }

    const fetchBalances = async () => {
      try {
        // Get user's address
        const userAddress = await particle.request({ method: "eth_accounts" });
        if (!userAddress[0]) return;

        const userPublicKey = new PublicKey(userAddress[0]);

        // Fetch SOL balance
        const balance = await connection.getBalance(userPublicKey);
        setSolBalance(balance / 1e9); // Convert lamports to SOL

        // Fetch token account
        const userTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          DISTRIBUTOR_KEYPAIR,
          GAME_TOKEN_MINT,
          userPublicKey
        );

        // Fetch token balance
        const tokenBalanceResponse = await connection.getTokenAccountBalance(
          userTokenAccount.address
        );
        setTokenBalance(tokenBalanceResponse.value.uiAmount || 0);
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
    const balanceInterval = setInterval(fetchBalances, 10000);

    return () => {
      clearInterval(balanceInterval);
    };
  }, [monster]);

  const convertToSol = async () => {
    if (isConverting || tokenBalance < CONVERSION_RATE.GAME_TOKENS) return;

    setIsConverting(true);
    try {
      const userAddress = await particle.request({ method: "eth_accounts" });
      if (!userAddress[0]) throw new Error("No wallet connected");

      const userPublicKey = new PublicKey(userAddress[0]);

      // Get user's token account
      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        DISTRIBUTOR_KEYPAIR,
        GAME_TOKEN_MINT,
        userPublicKey
      );

      // Create transaction to burn tokens
      const burnTransaction = new Transaction().add(
        createMintToInstruction(
          GAME_TOKEN_MINT,
          userTokenAccount.address,
          DISTRIBUTOR_KEYPAIR.publicKey,
          BigInt(-CONVERSION_RATE.GAME_TOKENS * 10 ** 9) // Negative amount to burn tokens
        )
      );

      // Add transfer SOL instruction
      burnTransaction.add(
        SystemProgram.transfer({
          fromPubkey: DISTRIBUTOR_KEYPAIR.publicKey,
          toPubkey: userPublicKey,
          lamports: CONVERSION_RATE.SOL_AMOUNT * LAMPORTS_PER_SOL,
        })
      );

      // Set fee payer
      burnTransaction.feePayer = DISTRIBUTOR_KEYPAIR.publicKey;

      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        connection,
        burnTransaction,
        [DISTRIBUTOR_KEYPAIR]
      );

      // Update balances
      const solBalance = await connection.getBalance(userPublicKey);
      setSolBalance(solBalance / LAMPORTS_PER_SOL);

      const tokenBalanceResponse = await connection.getTokenAccountBalance(
        userTokenAccount.address
      );
      setTokenBalance(tokenBalanceResponse.value.uiAmount || 0);
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const generateMonster = () => {
    const health = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
    const monsterType = monsterTypes.find(
      (m) => health >= m.minHealth && health <= m.maxHealth
    )!;
    setMonster({
      health,
      maxHealth: health,
      type: monsterType.type as Monster["type"],
      reward: monsterType.reward,
    });
    setCurrentReward(monsterType.reward);
  };

  const handleClick = () => {
    if (energy > 0 && monster) {
      setEnergy((prevEnergy) => prevEnergy - 1);

      const newHealth = monster.health - 1;
      if (newHealth <= 0) {
        setShowReward(true);
      } else {
        setMonster({ ...monster, health: newHealth });
      }
    }
  };

  const handleRewardClaim = async () => {
    if (isClaiming) return;

    setIsClaiming(true);
    try {
      const userAddress = await particle.request({ method: "eth_accounts" });

      if (!userAddress[0]) {
        throw new Error("No wallet connected");
      }

      const userPublicKey = new PublicKey(userAddress[0]);

      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        DISTRIBUTOR_KEYPAIR,
        GAME_TOKEN_MINT,
        userPublicKey
      );

      const transaction = new Transaction().add(
        createMintToInstruction(
          GAME_TOKEN_MINT,
          userTokenAccount.address,
          DISTRIBUTOR_KEYPAIR.publicKey,
          BigInt(currentReward * 10 * 9)
        )
      );

      // Set the payer for the transaction
      transaction.feePayer = DISTRIBUTOR_KEYPAIR.publicKey;

      // Sign and send the transaction
      const signature = await connection.sendTransaction(transaction, [
        DISTRIBUTOR_KEYPAIR,
      ]);
      await connection.confirmTransaction(signature);

      // Reset game state
      setShowReward(false);
      generateMonster();

      // Update token balance
      const balance = await connection.getTokenAccountBalance(
        userTokenAccount.address
      );
      setTokenBalance(balance.value.uiAmount || 0);
    } catch (error) {
      console.error("Error claiming reward:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <div>
          <p>{solBalance.toFixed(4)} SOL</p>
          <p>
            {Number(tokenBalance).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}{" "}
            Game Coins
          </p>
        </div>

        {tokenBalance >= CONVERSION_RATE.GAME_TOKENS && (
          <div>
            <button
              onClick={convertToSol}
              disabled={isConverting}
              className={`px-4 py-2 bg-green-600 rounded-lg ${
                isConverting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-700"
              }`}
            >
              {isConverting
                ? "Converting..."
                : `Convert ${CONVERSION_RATE.GAME_TOKENS} coins to ${CONVERSION_RATE.SOL_AMOUNT} SOL`}
            </button>
          </div>
        )}
      </div>

      {monster && (
        <div className="text-center">
          <div className="relative cursor-pointer" onClick={handleClick}>
            <Image
              src={monsterTypes.find((m) => m.type === monster.type)!.image}
              alt={monster.type}
              width={200}
              height={200}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
              Click to attack!
            </div>
          </div>
          <div className="mt-4">
            {monsterTypes.find((m) => m.type === monster.type)?.name ||
              "Monster"}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
            <div
              className="bg-red-500 rounded-full h-4"
              style={{
                width: `${(monster.health / monster.maxHealth) * 100}%`,
              }}
            ></div>
          </div>
          <div className="mt-1">
            {monster.health}/{monster.maxHealth}
          </div>
        </div>
      )}

      <div className="mt-4 w-64 bg-gray-700 rounded-full h-6">
        <div
          className="bg-green-500 rounded-full h-6"
          style={{ width: `${(energy / 30) * 100}%` }}
        ></div>
      </div>
      <div className="mt-2">Energy: {energy}/30</div>

      {showReward && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4 text-white">
              {monsterTypes.find((m) => m.type === monster!.type)?.name ||
                "Monster"}{" "}
              Defeated!
            </h2>
            <p className="text-gray-300 mb-4">
              You earned {currentReward} coins!
            </p>
            <button
              className={`mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                isClaiming ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleRewardClaim}
              disabled={isClaiming}
            >
              {isClaiming ? "Claiming..." : "Claim Reward"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniGame;
