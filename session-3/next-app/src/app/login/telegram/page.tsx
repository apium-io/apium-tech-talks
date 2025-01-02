"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ParticleNetwork } from "@particle-network/auth";
import { SolanaWallet } from "@particle-network/solana-wallet";
import { WalletEntryPosition } from "@particle-network/auth";
import MiniGame from "../../components/MiniGame";

interface PageProps {
  searchParams: {
    userId: string;
    username?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openLink: (url: string) => void;
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export default function TelegramMiniApp({ searchParams }: PageProps) {
  const [particle, setParticle] = useState<ParticleNetwork | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Telegram Mini App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    const init = async () => {
      try {
        if (!searchParams.userId) {
          throw new Error("Missing user ID parameter");
        }

        const particleInstance = new ParticleNetwork({
          projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
          clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
          appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
          chainName: "solana",
          chainId: 103,
          wallet: {
            displayWalletEntry: true,
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
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [searchParams.userId]);

  const login = async () => {
    if (!particle) {
      console.log("Particle not initialized yet");
      return;
    }

    try {
      const userInfo = await particle.auth.login({
        preferredAuthType: "email",
        supportAuthTypes: "email",
      });

      if (userInfo) {
        const solanaWallet = new SolanaWallet(particle.auth);
        await solanaWallet.connect();
        const addr = await particle.auth.getSolanaAddress();
        if (addr) {
          setAddress(addr);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const logout = async () => {
    if (!particle) return;

    try {
      await particle.auth.logout();
      setAddress(null);
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error.message : "Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <div>Initializing Particle Network...</div>
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
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="h-screen w-full">
      {!address ? (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={login}
            className={`px-4 py-2 rounded-lg ${
              particle
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!particle}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="p-4 flex justify-between items-center">
            <p className="text-sm">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
          <MiniGame />
        </>
      )}
    </main>
  );
}
