// import "./globals.css";
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import Providers from "./Providers";
// import Script from "next/script";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "thirdweb SDK + Next starter",
//   description:
//     "Starter template for using thirdweb SDK with Next.js App router",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <Providers>{children}</Providers>
//         <script src="https://telegram.org/js/telegram-web-app.js"></script>
//         <meta
//           http-equiv="Content-Security-Policy"
//           content="default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss://api.devnet.solana.com;"
//         ></meta>
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./Providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thirdweb SDK + Next starter",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
  metadataBase: new URL("https://your-domain.com"),
  other: {
    "Content-Security-Policy":
      "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss://api.devnet.solana.com; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline' https:;",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
