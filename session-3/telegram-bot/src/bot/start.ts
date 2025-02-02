import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "#root/bot/context.js";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";
import { config } from "dotenv";
config({ path: ".env.local" });

const composer = new Composer<Context>();

const feature = composer.chatType("private");

const adminAccount = privateKeyToAccount({
  privateKey: process.env.ADMIN_SECRET_KEY as string,
  client: createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT_ID as string,
  }),
});

feature.command("start", async (ctx) => {
  const username = ctx.from?.username;
  const userId = ctx.from?.id;

  const keyboard = new InlineKeyboard().webApp(
    "Start Your Adventure", // Changed from "Create Wallet"
    `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?userId=${userId}&username=${username}`
  );

  return ctx.reply(
    "🎮 Welcome to Monster Slayer! Embark on an epic adventure where you can:\n\n" +
      "⚔️ Battle unique monsters\n" +
      "💰 Earn rewards for your victories\n\n" +
      "Click below to begin your journey!",
    {
      reply_markup: keyboard,
    }
  );
});

// feature.command("start", async (ctx) => {
//   const username = ctx.from?.username;
//   const userId = ctx.from?.id;

//   const keyboard = new InlineKeyboard().webApp(
//     "Create Wallet",
//     `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?userId=${userId}&username=${username}`
//   );

//   return ctx.reply("Click below to create your Solana wallet with Particle!", {
//     reply_markup: keyboard,
//   });
// });

// feature.command("start", async (ctx) => {
//   const username = ctx.from?.username;
//   const userId = ctx.from?.id;

//   const url = `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?userId=${userId}&username=${username}`;

//   return ctx.reply(
//     `Click [here](${url}) to create your Solana wallet with Particle!`,
//     {
//       parse_mode: "Markdown",
//     }
//   );
// });

export { composer as startFeature };
