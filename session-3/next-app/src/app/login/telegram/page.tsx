// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { useActiveAccount, useConnect } from "thirdweb/react";
// import { inAppWallet } from "thirdweb/wallets";
// import { sepolia } from "thirdweb/chains";
// import { useRouter } from "next/navigation";
// import { client } from "../../client";
// import { Loader2 } from "lucide-react";

// export default function TelegramLogin({ searchParams }: { searchParams: { signature: string, message: string } }) {
//     const { connect } = useConnect();
//     const router = useRouter();

//     // This will connect to our wallet automatically on success, so we don't need to worry about the return data
//     useQuery({
//         queryKey: ["telegram-login"],
//         queryFn: async () => {
//             await connect(async () => {
//                 const wallet = inAppWallet({
//                     smartAccount: {
//                         sponsorGas: true,
//                         chain: sepolia
//                     }
//                 });
//                 await wallet.connect({
//                     client,
//                     strategy: "auth_endpoint",
//                     payload: JSON.stringify({
//                         signature: searchParams.signature,
//                         message: searchParams.message,
//                     }),
//                     encryptionKey: process.env.NEXT_PUBLIC_AUTH_PHRASE as string,
//                 });
//                 return wallet;
//             });

//             router.replace("/");
//             return true;
//         },
//     });

//     return (
//         <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
//             <Loader2 className="h-12 w-12 animate-spin text-white" />
//             Generating wallet...
//         </div>
//     )
// }

// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES } from "@web3auth/base";
// import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
// import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
// import { Loader2 } from "lucide-react";

// export default function TelegramLogin({
//   searchParams,
// }: {
//   searchParams: { signature: string; message: string };
// }) {
//   const router = useRouter();

//   useEffect(() => {
//     console.log("signature", searchParams.signature);
//     console.log("message", searchParams.message);
//     const loginWithTelegram = async () => {
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

//         const openloginAdapter = new OpenloginAdapter({
//           adapterSettings: {
//             network: "sapphire_devnet",
//             uxMode: "redirect",
//             loginConfig: {
//               jwt: {
//                 name: "Telegram Login",
//                 verifier: "your-telegram-verifier-id",
//                 typeOfLogin: "jwt",
//               },
//             },
//           },
//         });

//         web3auth.configureAdapter(openloginAdapter as any);

//         await web3auth.initModal();

//         await web3auth.connectTo("openlogin", {
//           loginProvider: "jwt",
//           extraLoginOptions: {
//             id_token: searchParams.signature,
//             verifier: "your-telegram-verifier-id",
//             verifierId: searchParams.message,
//           },
//           login_hint: "",
//         });

//         router.replace("/");
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     loginWithTelegram();
//   }, [router, searchParams]);

//   return (
//     <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
//       <Loader2 className="h-12 w-12 animate-spin text-white" />
//       Connecting wallet...
//     </div>
//   );
// }

// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES } from "@web3auth/base";
// import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
// import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
// import { Loader2 } from "lucide-react";

// export default function GoogleLogin({
//   searchParams,
// }: {
//   searchParams: { signature: string; message: string };
// }) {
//   const router = useRouter();

//   useEffect(() => {
//     const loginWithGoogle = async () => {
//       try {
//         const web3auth = new Web3Auth({
//           clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
//           web3AuthNetwork: "sapphire_devnet",
//           chainConfig: {
//             chainNamespace: CHAIN_NAMESPACES.SOLANA,
//             chainId: "0x2",
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

//         const openloginAdapter = new OpenloginAdapter({
//           adapterSettings: {
//             network: "sapphire_devnet",
//             uxMode: "redirect",
//             loginConfig: {
//               google: {
//                 name: "Google Login",
//                 verifier: "telegram-cmg-verifier",
//                 typeOfLogin: "google",
//                 clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//               },
//             },
//           },
//         });

//         web3auth.configureAdapter(openloginAdapter as any);

//         await web3auth.initModal();

//         await web3auth.connectTo("openlogin", {
//           loginProvider: "google",
//           login_hint: "",
//           mfaLevel: "none",
//         });

//         router.replace("/");
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     loginWithGoogle();
//   }, [router, searchParams]);

//   return (
//     <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
//       <Loader2 className="h-12 w-12 animate-spin text-white" />
//       Connecting wallet...
//     </div>
//   );
// }

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS, IAdapter } from "@web3auth/base";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Loader2 } from "lucide-react";

export default function GoogleLogin({
  searchParams,
}: {
  searchParams: { signature: string; message: string };
}) {
  const router = useRouter();

  useEffect(() => {
    const loginWithGoogle = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.SOLANA,
          chainId: "0x2",
          rpcTarget: "https://api.devnet.solana.com",
          displayName: "Solana Devnet",
          blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
          ticker: "SOL",
          tickerName: "Solana",
        };

        const privateKeyProvider = new SolanaPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3auth = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
          web3AuthNetwork: "sapphire_devnet",
          chainConfig,
          privateKeyProvider,
        });

        const openloginAdapter = new OpenloginAdapter({
          privateKeyProvider,
          adapterSettings: {
            network: "sapphire_devnet",
            uxMode: "redirect",
            loginConfig: {
              google: {
                name: "Google Login",
                verifier: "telegram-cmg-verifier",
                typeOfLogin: "google",
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              },
            },
          },
        }) as unknown as IAdapter<unknown>;

        web3auth.configureAdapter(openloginAdapter);

        await web3auth.initModal();

        await web3auth.connectTo("openlogin", {
          loginProvider: "google",
          mfaLevel: "none",
        });

        router.replace("/");
      } catch (error) {
        console.error("Web3Auth error:", error);
      }
    };

    loginWithGoogle();
  }, [router, searchParams]);

  return (
    <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
      Connecting wallet...
    </div>
  );
}
