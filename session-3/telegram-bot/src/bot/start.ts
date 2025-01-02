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
    "Create Wallet",
    `${process.env.FRONTEND_APP_ORIGIN}/login/telegram?userId=${userId}&username=${username}`
  );

  return ctx.reply("Click below to create your Solana wallet with Particle!", {
    reply_markup: keyboard,
  });
});

export { composer as startFeature };
