// "use client";
// import { useActiveAccount } from "thirdweb/react";
// import { client } from "./client";
// import { AutoConnect } from "thirdweb/react";
// import MiniGame from "./components/MiniGame";

// export default function Home() {
//   const account = useActiveAccount();

//   return (
//     <main className="h-screen w-full">
//       <AutoConnect client={client} />
//       {account && (
//         <MiniGame />
//       )}
//     </main>
//   );
// }

// "use client";
// import { useEffect, useState } from "react";
// import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
// import { SolanaWallet } from "@web3auth/solana-provider";
// import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
// import * as web3 from "@solana/web3.js";
// import MiniGame from "./components/MiniGame";

// export default function Home() {
//   const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
//   const [provider, setProvider] = useState<IProvider | null>(null);
//   const [account, setAccount] = useState<string | null>(null);

//   useEffect(() => {
//     console.log("Initializing Web3Auth");
//     const init = async () => {
//       try {
//         const web3auth = new Web3Auth({
//           clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
//           web3AuthNetwork: "testnet",
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
//         console.error(error);
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
//       {!account ? (
//         <div className="flex items-center justify-center h-full">
//           <button
//             onClick={login}
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { SolanaWallet } from "@web3auth/solana-provider";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import MiniGame from "./components/MiniGame";

export default function Home() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Initializing Web3Auth");
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
          web3AuthNetwork: "sapphire_devnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: "0x2", // devnet
            rpcTarget: "https://api.devnet.solana.com",
            displayName: "Solana Devnet",
            blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
            ticker: "SOL",
            tickerName: "Solana",
          },
          privateKeyProvider: new SolanaPrivateKeyProvider({
            config: {
              chainConfig: {
                chainNamespace: CHAIN_NAMESPACES.SOLANA,
                chainId: "0x2",
                rpcTarget: "https://api.devnet.solana.com",
              },
            },
          }),
        });

        await web3auth.initModal();
        setWeb3auth(web3auth);
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      } finally {
        setLoading(false); // Initialization complete
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3authProvider) {
      const solanaWallet = new SolanaWallet(web3authProvider);
      const accounts = await solanaWallet.requestAccounts();
      setAccount(accounts[0]);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setAccount(null);
  };

  return (
    <main className="h-screen w-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Initializing Web3Auth...</p>
        </div>
      ) : !account ? (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={login}
            className={`px-4 py-2 rounded-lg ${
              web3auth
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!web3auth}
          >
            Login with Web3Auth
          </button>
        </div>
      ) : (
        <>
          <div className="p-4 flex justify-between items-center">
            <p className="text-sm">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          <MiniGame />
        </>
      )}
    </main>
  );
}
