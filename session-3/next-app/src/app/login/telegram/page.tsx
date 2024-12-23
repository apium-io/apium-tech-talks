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
