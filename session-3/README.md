# Telegram Mini App Game

## Overview

This project is a Telegram Mini App Game that integrates Web3 functionality to provide a seamless and interactive gaming experience. The setup involves configuring a Telegram bot, a web application, and a backend infrastructure powered by AWS.

---

## Prerequisites

1. **Telegram Account**: Required to create a bot using BotFather.
2. **Node.js**: To run the web application.
3. **ngrok**: For proxying localhost.
4. **AWS Account**: To set up Lambda, API Gateway, and DynamoDB.
5. **Web3 Wallet SDK**: Such as Particle, Web3Auth, or Thirdweb.

---

## Getting Started

### Step 1: Configure the Telegram Bot

1. **Create a Bot**:

   - Open Telegram and search for `@BotFather`.
   - Use the `/newbot` command to create a bot.
   - Provide the required details: name, description, and image.
   - Once done, you will receive a **Bot Token**. Save this securely.

2. **Generate a Secret Key**:

   - Use `openssl` or a random string generator to create a secure key.
   - Ensure the key is stored securely in your code.

3. **Proxy Localhost**:

   - Use [ngrok](https://ngrok.com/) to proxy your localhost to an HTTPS domain (a Telegram requirement).
   - Example:
     ```bash
     ngrok http http://localhost:3000
     ```

4. **Set Up Environment Variables**:

   - Create a `.env.local` file in the `telegram-bot` directory with the following:

     ```env
     # Telegram Bot Configuration
     BOT_MODE=polling
     LOG_LEVEL=debug
     DEBUG=true
     SERVER_HOST=localhost
     SERVER_PORT=3000
     BOT_ADMINS=[1]

     # Telegram Bot Token
     BOT_TOKEN=your-bot-token

     # Secret Key
     ADMIN_SECRET_KEY=your-secret-key

     # Frontend App URL
     FRONTEND_APP_ORIGIN=your-ngrok-url
     ```

---

### Step 2: Configure the Web Application

1. **Set Up Wallet Integration**:

   - Use [Particle](https://particle.network/), [Web3Auth](https://web3auth.io/), or [Thirdweb](https://thirdweb.com/).
   - Follow their respective documentation to generate project IDs and client keys.

2. **Set Up Environment Variables**:

   - Create a `.env.local` file in the `webapp` directory with the following:

     ```env
     # Thirdweb/Particle Configuration
     NEXT_PUBLIC_CLIENT_ID=your-thirdweb-client-id
     NEXT_PUBLIC_PARTICLE_PROJECT_ID=your-particle-project-id
     NEXT_PUBLIC_PARTICLE_CLIENT_KEY=your-particle-client-key
     NEXT_PUBLIC_PARTICLE_APP_ID=your-particle-app-id
     NEXT_PUBLIC_PARTICLE_APP_SECRET=your-particle-app-secret

     # Telegram Bot Integration
     NEXT_PUBLIC_TELEGRAM_BOT_ID=your-telegram-bot-id

     # Authentication
     NEXT_PUBLIC_AUTH_PHRASE=your-auth-phrase

     # Backend Endpoint
     NEXT_PUBLIC_ENDPOINT=your-api-gateway-endpoint
     ```

---

### Step 3: Configure the Backend

1. **AWS Setup**:

   - **Lambda**: Create a Lambda function and set the handler to `dist/index.lambdaHandler`.
   - **API Gateway**: Create an API Gateway and connect it to the Lambda function.
   - **DynamoDB**: Create a table to store user game coins.

2. **Update the Endpoint**:
   - Add the API Gateway endpoint to the `NEXT_PUBLIC_ENDPOINT` variable in your `.env.local` file for the web application.

---

## Final Steps

1. **Run the Telegram Bot**:

   - Navigate to the `telegram-bot` directory and run:
     ```bash
     npm install
     npm run dev
     ```

2. **Run the Web Application**:

   - Navigate to the `webapp` directory and run:
     ```bash
     npm install
     npm run dev
     ```

3. **Verify the Backend**:
   - Test the AWS Lambda function and API Gateway using the provided endpoint.

---

## Additional Notes

- Ensure all sensitive information (e.g., tokens, secret keys) is kept secure.
- Regularly update dependencies to maintain security and compatibility.
- Refer to the [Telegram Bot API documentation](https://core.telegram.org/bots/api) for advanced bot customization.

---

## Contributing

If you want to contribute to this project, please open a pull request or submit an issue for review.

---
