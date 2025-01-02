import { NextResponse } from "next/server";
import crypto from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

function verifyTelegramData(data: any) {
  const { hash, ...userData } = data;

  // Create a sorted string of key=value pairs
  const dataCheckString = Object.keys(userData)
    .sort()
    .map((key) => `${key}=${userData[key]}`)
    .join("\n");

  // Create a hash using your bot token
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Verify the data
    const isValid = verifyTelegramData(data);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid authentication data" },
        { status: 400 }
      );
    }

    // Check if the auth_date is not too old (optional, but recommended)
    const authTimestamp = data.auth_date * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const maxAge = 1000 * 60 * 60; // 1 hour

    if (currentTime - authTimestamp > maxAge) {
      return NextResponse.json(
        { error: "Authentication too old" },
        { status: 400 }
      );
    }

    // Return user data that can be used with Particle
    return NextResponse.json({
      success: true,
      userData: {
        telegramId: data.id.toString(),
        firstName: data.first_name,
        username: data.username || null,
        photoUrl: data.photo_url || null,
      },
    });
  } catch (error) {
    console.error("Error verifying Telegram data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
