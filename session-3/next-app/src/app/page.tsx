// "use client";
// import { useEffect, useState } from "react";
// import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
// import { SolanaWallet } from "@web3auth/solana-provider";
// import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
// import MiniGame from "./components/MiniGame";

// export default function Home() {
//   const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
//   const [provider, setProvider] = useState<IProvider | null>(null);
//   const [account, setAccount] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     console.log("Initializing Web3Auth");
//     const init = async () => {
//       try {
//         const web3auth = new Web3Auth({
//           clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
//           web3AuthNetwork: "sapphire_devnet",
//           chainConfig: {
//             chainNamespace: CHAIN_NAMESPACES.SOLANA,
//             chainId: "0x2", // devnet
//             rpcTarget: "https://api.devnet.solana.com",
//             displayName: "Solana Devnet",
//             blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
//             ticker: "SOL",
//             tickerName: "Solana",
//           },
//           privateKeyProvider: new SolanaPrivateKeyProvider({
//             config: {
//               chainConfig: {
//                 chainNamespace: CHAIN_NAMESPACES.SOLANA,
//                 chainId: "0x2",
//                 rpcTarget: "https://api.devnet.solana.com",
//               },
//             },
//           }),
//         });

//         await web3auth.initModal();
//         setWeb3auth(web3auth);
//       } catch (error) {
//         console.error("Error initializing Web3Auth:", error);
//       } finally {
//         setLoading(false); // Initialization complete
//       }
//     };

//     init();
//   }, []);

//   const login = async () => {
//     if (!web3auth) {
//       console.log("web3auth not initialized yet");
//       return;
//     }
//     const web3authProvider = await web3auth.connect();
//     setProvider(web3authProvider);
//     if (web3authProvider) {
//       const solanaWallet = new SolanaWallet(web3authProvider);
//       const accounts = await solanaWallet.requestAccounts();
//       setAccount(accounts[0]);
//     }
//   };

//   const logout = async () => {
//     if (!web3auth) {
//       console.log("web3auth not initialized yet");
//       return;
//     }
//     await web3auth.logout();
//     setProvider(null);
//     setAccount(null);
//   };

//   return (
//     <main className="h-screen w-full">
//       {loading ? (
//         <div className="flex items-center justify-center h-full">
//           <p className="text-gray-500">Initializing Web3Auth...</p>
//         </div>
//       ) : !account ? (
//         <div className="flex items-center justify-center h-full">
//           <button
//             onClick={login}
//             className={`px-4 py-2 rounded-lg ${
//               web3auth
//                 ? "bg-blue-500 text-white hover:bg-blue-600"
//                 : "bg-gray-400 text-gray-700 cursor-not-allowed"
//             }`}
//             disabled={!web3auth}
//           >
//             Login with Web3Auth
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="p-4 flex justify-between items-center">
//             <p className="text-sm">
//               Connected: {account.slice(0, 6)}...{account.slice(-4)}
//             </p>
//             <button
//               onClick={logout}
//               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//             >
//               Logout
//             </button>
//           </div>
//           <MiniGame />
//         </>
//       )}
//     </main>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { ParticleNetwork } from "@particle-network/auth";
import { SolanaWallet } from "@particle-network/solana-wallet";
import { WalletEntryPosition } from "@particle-network/auth";
import MiniGame from "./components/MiniGame";

export default function Home() {
  const [particle, setParticle] = useState<ParticleNetwork | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const particleInstance = new ParticleNetwork({
          projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
          clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
          appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
          chainName: "solana",
          chainId: 103, // Solana devnet
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
        console.error("Error initializing Particle:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!particle) {
      console.log("Particle not initialized yet");
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
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    if (!particle) {
      console.log("Particle not initialized yet");
      return;
    }

    try {
      await particle.auth.logout();
      setAddress(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <main className="h-screen w-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Initializing Particle Network...</p>
        </div>
      ) : !address ? (
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
