"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ParticleNetwork } from "@particle-network/auth";
import { SolanaWallet } from "@particle-network/solana-wallet";
import { WalletEntryPosition } from "@particle-network/auth";
import MiniGame from "./components/MiniGame";

export default function Home() {
  const [particle, setParticle] = useState<ParticleNetwork | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initRetries, setInitRetries] = useState(0);
  const [userSaved, setUserSaved] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Add a small delay before initialization
        await new Promise((resolve) => setTimeout(resolve, 500));

        const particleInstance = new ParticleNetwork({
          projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
          clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
          appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
          chainName: "solana",
          chainId: 103, // Solana devnet
          wallet: {
            displayWalletEntry: false,
            defaultWalletEntryPosition: WalletEntryPosition.BR,
          },
        });

        setParticle(particleInstance);

        // Check if user is already logged in
        const userInfo = particleInstance.auth.getUserInfo();
        if (userInfo) {
          const addr = await particleInstance.auth.getSolanaAddress();
          if (addr) {
            setAddress(addr);
            await verifyUserInDB("789121233213213", addr);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error initializing:", error);
        if (initRetries < 3) {
          setInitRetries((prev) => prev + 1);
          setTimeout(init, 1000);
        } else {
          setError(
            "Unable to initialize game. Please try refreshing the page."
          );
          setLoading(false);
        }
      }
    };

    init();
  }, [initRetries]);

  const verifyUserInDB = async (userId: string, walletAddress: string) => {
    try {
      const response = await fetch(
        `https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user/${userId}/status?walletAddress=${walletAddress}`
      );

      if (!response.ok) {
        await saveUserToDB(userId, walletAddress);
      } else {
        setUserSaved(true);
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      await saveUserToDB(userId, walletAddress);
    }
  };

  const saveUserToDB = async (userId: string, walletAddress: string) => {
    try {
      const response = await fetch(
        `https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, walletAddress }),
        }
      );
      const data = await response.json();

      // Wait for DB propagation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUserSaved(true);
      return data;
    } catch (error) {
      console.error("Failed to save user:", error);
      throw error;
    }
  };

  const login = async () => {
    if (!particle) {
      console.error("Game not initialized yet");
      return;
    }

    try {
      const userInfo = await particle.auth.login();
      if (userInfo) {
        const solanaWallet = new SolanaWallet(particle.auth);
        await solanaWallet.connect();
        const addr = await particle.auth.getSolanaAddress();
        if (addr) {
          setAddress(addr);
          await saveUserToDB("789121233213213", addr);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to sign in. Please try again.");
    }
  };

  const logout = async () => {
    if (!particle) return;

    try {
      await particle.auth.logout();
      setAddress(null);
      setUserSaved(false);
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <div>Setting up your game...</div>
        <div className="text-sm text-gray-400">
          This might take a few moments
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 text-center">
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="h-screen w-full">
      {!address ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h1 className="text-2xl font-bold mb-2">
            Welcome to Monster Slayer!
          </h1>
          <p className="text-center text-gray-300 mb-4 max-w-md px-4">
            Embark on an epic adventure! Battle monsters, earn rewards, and
            become a legendary hero.
          </p>
          <button
            onClick={login}
            className={`px-6 py-3 rounded-lg text-lg font-semibold ${
              particle
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!particle}
          >
            Start Your Adventure
          </button>
          <p className="text-sm text-gray-400 mt-2">
            Sign in with email to begin your journey
          </p>
        </div>
      ) : !userSaved ? (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <div>Creating your adventure profile...</div>
        </div>
      ) : (
        <>
          <div className="p-4 flex justify-between items-center">
            <a
              href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(address).then(() => {
                  alert("Address copied to clipboard!");
                  window.open(
                    `https://explorer.solana.com/address/${address}?cluster=devnet`,
                    "_blank"
                  );
                });
              }}
            >
              Player ID: {address.slice(0, 6)}...{address.slice(-4)}
            </a>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Exit Game
            </button>
          </div>
          <MiniGame
            userId="6924657782"
            walletAddress="66GnfsmidW9hKPpvetxcwUtzsUBuEvY3iTiDsRT4J17k"
          />
        </>
      )}
    </main>
  );
}
