import React, { useState, useEffect } from "react";
import Image from "next/image";

interface MiniGameProps {
  userId: string;
  walletAddress: string;
}

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
    reward: 30,
    image: "/goblin.png",
  },
  {
    type: "golem",
    name: "Golem",
    minHealth: 61,
    maxHealth: 75,
    reward: 30,
    image: "/golem.png",
  },
  {
    type: "wizard",
    name: "Wizard",
    minHealth: 76,
    maxHealth: 85,
    reward: 30,
    image: "/wizard.png",
  },
  {
    type: "darkKnight",
    name: "Dark Knight",
    minHealth: 86,
    maxHealth: 95,
    reward: 30,
    image: "/darkKnight.png",
  },
  {
    type: "darkDragon",
    name: "Dark Dragon",
    minHealth: 96,
    maxHealth: 100,
    reward: 35,
    image: "/darkDragon.png",
  },
];

const COINS_NEEDED_FOR_SOLANA = 30;
const SOLANA_REWARD = 0.01;

const MiniGame: React.FC<MiniGameProps> = ({ userId, walletAddress }) => {
  const [energy, setEnergy] = useState(30);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [isClaimingSOL, setIsClaimingSOL] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  const generateMonster = () => {
    const health = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
    const monsterType = monsterTypes.find(
      (m) => health >= m.minHealth && health <= m.maxHealth
    )!;
    console.log("monsterType", monsterType);
    setMonster({
      health,
      maxHealth: health,
      type: monsterType.type as Monster["type"],
      reward: monsterType.reward,
    });
    console.log("monster", monsterType.image);
    setCurrentReward(monsterType.reward);
  };

  const updateUserBalance = async (newBalance: number) => {
    try {
      const response = await fetch(
        `https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user/${userId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress,
            gameCoins: newBalance,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("User not found");
        } else if (response.status === 400) {
          throw new Error("Invalid wallet address");
        }
        throw new Error(errorData.message || "Failed to update balance");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating balance:", error);
      throw error;
    }
  };

  const claimSolana = async () => {
    setIsClaimingSOL(true);
    setError(null);

    try {
      const response = await fetch(
        `https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user/${userId}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress,
            amount: SOLANA_REWARD,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to claim SOL. Please try again later.");
      }

      const data = await response.json();

      setTokenBalance((prev) => prev - COINS_NEEDED_FOR_SOLANA);
      setShowClaimSuccess(true);

      setTimeout(() => {
        setShowClaimSuccess(false);
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Failed to claim SOL");
    } finally {
      setIsClaimingSOL(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prevEnergy) => Math.min(prevEnergy + 1, 30));
    }, 500);

    if (!monster) {
      generateMonster();
    }

    return () => clearInterval(timer);
  }, [monster]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user/${userId}/status?walletAddress=${walletAddress}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setTokenBalance(data.gameCoins || 0);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load game data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, walletAddress]);

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
    if (isUpdatingBalance) return;

    setIsUpdatingBalance(true);
    const newBalance = tokenBalance + currentReward;

    try {
      await updateUserBalance(newBalance);
      setTokenBalance(newBalance);
      setShowReward(false);
      console.log("getting called");
      generateMonster();
    } catch (error) {
      setError("Failed to update balance. Please try again.");
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading game data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-4">
          <p>
            {Number(tokenBalance).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}{" "}
            Game Coins
          </p>

          {tokenBalance >= COINS_NEEDED_FOR_SOLANA && (
            <button
              onClick={claimSolana}
              disabled={isClaimingSOL}
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                isClaimingSOL ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isClaimingSOL
                ? "Claiming..."
                : `Claim ${SOLANA_REWARD} SOL (${COINS_NEEDED_FOR_SOLANA} coins)`}
            </button>
          )}

          {showClaimSuccess && (
            <div className="text-green-500 font-semibold">
              Successfully claimed {SOLANA_REWARD} SOL!
            </div>
          )}
        </div>
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
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              className={`mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                isUpdatingBalance ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleRewardClaim}
              disabled={isUpdatingBalance}
            >
              {isUpdatingBalance ? "Updating..." : "Claim Reward"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniGame;
