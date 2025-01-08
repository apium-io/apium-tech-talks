// "use client";
// import { useEffect, useState } from "react";
// import { Loader2 } from "lucide-react";
// import { ParticleNetwork } from "@particle-network/auth";
// import { SolanaWallet } from "@particle-network/solana-wallet";
// import { WalletEntryPosition } from "@particle-network/auth";
// import MiniGame from "../../components/MiniGame";

// declare global {
//   interface Window {
//     Telegram?: {
//       WebApp?: {
//         openLink: (url: string) => void;
//         ready: () => void;
//         expand: () => void;
//       };
//     };
//   }
// }

// interface PageProps {
//   searchParams: {
//     userId: string;
//     username?: string;
//   };
// }

// export default function TelegramMiniApp({ searchParams }: PageProps) {
//   const [particle, setParticle] = useState<ParticleNetwork | null>(null);
//   const [address, setAddress] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userSaved, setUserSaved] = useState(false);
//   const [initRetries, setInitRetries] = useState(0);

//   useEffect(() => {
//     // Initialize Telegram Mini App
//     if (window.Telegram?.WebApp) {
//       window.Telegram.WebApp.ready();
//       window.Telegram.WebApp.expand();
//     }

//     const init = async () => {
//       try {
//         if (!searchParams.userId) {
//           throw new Error("Missing user ID parameter");
//         }

//         // Add a small delay before initialization to ensure proper loading
//         await new Promise((resolve) => setTimeout(resolve, 500));

//         const particleInstance = new ParticleNetwork({
//           projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
//           clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
//           appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
//           chainName: "solana",
//           chainId: 103,
//           wallet: {
//             displayWalletEntry: false,
//             defaultWalletEntryPosition: WalletEntryPosition.BR,
//           },
//         });

//         setParticle(particleInstance);

//         // Check if user is already logged in
//         const userInfo = particleInstance.auth.getUserInfo();
//         console.log("User Info:", userInfo);
//         if (userInfo) {
//           const addr = await particleInstance.auth.getSolanaAddress();
//           if (addr) {
//             setAddress(addr);
//             await verifyUserInDB(searchParams.userId, addr);
//           }
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Initialization error:", error);
//         if (initRetries < 3) {
//           // Retry initialization up to 3 times
//           setInitRetries((prev) => prev + 1);
//           setTimeout(init, 1000); // Wait 1 second before retrying
//         } else {
//           setError(
//             "Unable to initialize game. Please try refreshing the page."
//           );
//           setLoading(false);
//         }
//       }
//     };

//     init();
//   }, [searchParams.userId, initRetries]);

//   const verifyUserInDB = async (userId: string, walletAddress: string) => {
//     try {
//       const response = await fetch(
//         `https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user/${userId}/status?walletAddress=${walletAddress}`
//       );

//       if (!response.ok) {
//         await saveUserToDB(userId, walletAddress);
//       } else {
//         setUserSaved(true);
//       }
//     } catch (error) {
//       console.error("Error verifying user:", error);
//       await saveUserToDB(userId, walletAddress);
//     }
//   };

//   const saveUserToDB = async (userId: string, walletAddress: string) => {
//     try {
//       const response = await fetch(
//         "https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId, walletAddress }),
//         }
//       );
//       const data = await response.json();

//       // Wait a short moment for DB propagation
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       setUserSaved(true);
//       return data;
//     } catch (error) {
//       console.error("Failed to save user:", error);
//       throw error;
//     }
//   };

//   const login = async () => {
//     if (!particle) {
//       console.error("Particle not initialized yet");
//       return;
//     }

//     try {
//       const userInfo = await particle.auth.login({
//         preferredAuthType: "email",
//         supportAuthTypes: "email",
//       });

//       if (userInfo) {
//         const solanaWallet = new SolanaWallet(particle.auth);
//         await solanaWallet.connect();
//         const addr = await particle.auth.getSolanaAddress();
//         if (addr) {
//           setAddress(addr);
//           await saveUserToDB(searchParams.userId, addr);
//         }
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setError(error instanceof Error ? error.message : "Login failed");
//     }
//   };

//   const logout = async () => {
//     if (!particle) return;

//     try {
//       await particle.auth.logout();
//       setAddress(null);
//       setUserSaved(false);
//     } catch (error) {
//       console.error("Logout error:", error);
//       setError(error instanceof Error ? error.message : "Logout failed");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen gap-4">
//         <Loader2 className="h-12 w-12 animate-spin text-white" />
//         <div>Initializing Particle Network...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 text-center">
//         <div className="text-red-500">Error: {error}</div>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen gap-4">
//         <Loader2 className="h-12 w-12 animate-spin text-white" />
//         <div>Setting up your game...</div>
//         <div className="text-sm text-gray-400">
//           This might take a few moments
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 text-center">
//         <div className="text-red-500">Error: {error}</div>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <main className="h-screen w-full">
//       {!address ? (
//         <div className="flex flex-col items-center justify-center h-full gap-4">
//           <h1 className="text-xl font-bold mb-2">Welcome to Monster Slayer!</h1>
//           <p className="text-center text-gray-300 mb-4 px-4">
//             Sign in with your email to start your adventure and earn rewards
//           </p>
//           <button
//             onClick={login}
//             className={`px-6 py-3 rounded-lg text-lg font-semibold ${
//               particle
//                 ? "bg-blue-500 text-white hover:bg-blue-600"
//                 : "bg-gray-400 text-gray-700 cursor-not-allowed"
//             }`}
//             disabled={!particle}
//           >
//             Start Game
//           </button>
//         </div>
//       ) : !userSaved ? (
//         <div className="flex flex-col items-center justify-center h-screen gap-4">
//           <Loader2 className="h-12 w-12 animate-spin text-white" />
//           <div>Creating your adventure profile...</div>
//         </div>
//       ) : (
//         <>
//           <div className="p-4 flex justify-between items-center">
//             {/* <p className="text-sm">
//               Wallet Address: {address.slice(0, 6)}...{address.slice(-4)}
//             </p> */}
//             <a
//               href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-sm text-blue-500 hover:underline"
//               onClick={(e) => {
//                 e.preventDefault();
//                 navigator.clipboard.writeText(address).then(() => {
//                   alert("Address copied to clipboard!");
//                   window.open(
//                     `https://explorer.solana.com/address/${address}?cluster=devnet`,
//                     "_blank"
//                   );
//                 });
//               }}
//             >
//               Player Wallet: {address.slice(0, 6)}...{address.slice(-4)}
//             </a>
//             <button
//               onClick={logout}
//               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//             >
//               Exit Game
//             </button>
//           </div>
//           <MiniGame userId={searchParams.userId} walletAddress={address} />
//         </>
//       )}
//     </main>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ParticleNetwork } from "@particle-network/auth";
import { SolanaWallet } from "@particle-network/solana-wallet";
import { WalletEntryPosition } from "@particle-network/auth";
import MiniGame from "../../components/MiniGame";

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

interface PageProps {
  searchParams: {
    userId: string;
    username?: string;
  };
}

export default function TelegramMiniApp({ searchParams }: PageProps) {
  const [particle, setParticle] = useState<ParticleNetwork | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSaved, setUserSaved] = useState(false);
  const [initRetries, setInitRetries] = useState(0);
  const [initializationStatus, setInitializationStatus] = useState<string>(
    "Starting initialization..."
  );

  useEffect(() => {
    console.log("1. Effect started");
    let mounted = true;

    const init = async () => {
      try {
        console.log("2. Init function started");

        // Log environment variables (safely)
        console.log("3. Environment variables present:", {
          hasProjectId: !!process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
          hasClientKey: !!process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
          hasAppId: !!process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
        });

        // Validate environment variables
        if (
          !process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID ||
          !process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ||
          !process.env.NEXT_PUBLIC_PARTICLE_APP_ID
        ) {
          throw new Error("Missing required environment variables");
        }

        console.log("4. Checking userId");
        if (!searchParams.userId) {
          throw new Error("Missing user ID parameter");
        }

        console.log("5. Initializing Telegram WebApp");
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }

        console.log("6. Creating Particle instance");
        const particleInstance = new ParticleNetwork({
          projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
          clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
          appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
          chainName: "solana",
          chainId: 103,
          wallet: {
            displayWalletEntry: false,
            defaultWalletEntryPosition: WalletEntryPosition.BR,
          },
        });

        console.log("7. Particle instance created");
        if (!mounted) return;
        setParticle(particleInstance);

        console.log("8. Checking user info");
        const userInfo = await particleInstance.auth.getUserInfo();
        console.log("9. User Info:", userInfo);

        if (mounted) {
          setLoading(false);
          setInitializationStatus("");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (mounted) {
          if (initRetries < 3) {
            console.log(`Retrying... Attempt ${initRetries + 1}/3`);
            setInitRetries((prev) => prev + 1);
            setTimeout(init, 1500);
          } else {
            setError(
              `Unable to initialize game: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
            setLoading(false);
          }
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [searchParams.userId, initRetries]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;

      try {
        // Validate environment variables first
        if (
          !process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID ||
          !process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ||
          !process.env.NEXT_PUBLIC_PARTICLE_APP_ID
        ) {
          throw new Error("Missing required environment variables");
        }

        setInitializationStatus("Checking user ID...");
        if (!searchParams.userId) {
          throw new Error("Missing user ID parameter");
        }

        // Initialize Telegram Mini App
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }

        setInitializationStatus("Creating Particle instance...");
        const particleInstance = new ParticleNetwork({
          projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
          clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
          appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
          chainName: "solana",
          chainId: 103,
          wallet: {
            displayWalletEntry: false,
            defaultWalletEntryPosition: WalletEntryPosition.BR,
          },
        });

        if (!mounted) return;
        setParticle(particleInstance);

        // Check if user is already logged in
        setInitializationStatus("Checking login status...");
        const userInfo = await particleInstance.auth.getUserInfo();
        console.log("User Info:", userInfo);

        if (userInfo) {
          setInitializationStatus("Getting Solana address...");
          const addr = await particleInstance.auth.getSolanaAddress();
          if (addr && mounted) {
            setAddress(addr);
            await verifyUserInDB(searchParams.userId, addr);
          }
        }

        if (mounted) {
          setLoading(false);
          setInitializationStatus("");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (mounted) {
          if (initRetries < 3) {
            setInitRetries((prev) => prev + 1);
            setInitializationStatus(
              `Retrying initialization (attempt ${initRetries + 1}/3)...`
            );
            setTimeout(init, 1500);
          } else {
            setError(
              `Unable to initialize game: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
            setLoading(false);
            setInitializationStatus("");
          }
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [searchParams.userId, initRetries]);

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
        "https://io7mouomvl.execute-api.eu-central-1.amazonaws.com/dev/user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, walletAddress }),
        }
      );
      const data = await response.json();

      // Wait a short moment for DB propagation
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
      console.error("Particle not initialized yet");
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
          await saveUserToDB(searchParams.userId, addr);
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
      setUserSaved(false);
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error.message : "Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <div>{initializationStatus || "Initializing Particle Network..."}</div>
        <div className="text-sm text-gray-400">
          {initRetries > 0
            ? `Retry attempt ${initRetries}/3`
            : "This might take a few moments"}
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
          <h1 className="text-xl font-bold mb-2">Welcome to Monster Slayer!</h1>
          <p className="text-center text-gray-300 mb-4 px-4">
            Sign in with your email to start your adventure and earn rewards
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
            Start Game
          </button>
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
              Player Wallet: {address.slice(0, 6)}...{address.slice(-4)}
            </a>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Exit Game
            </button>
          </div>
          <MiniGame userId={searchParams.userId} walletAddress={address} />
        </>
      )}
    </main>
  );
}
