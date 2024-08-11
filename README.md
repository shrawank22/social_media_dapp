# Decentralized Social Media App

This is a decentralized social media application that leverages blockchain technology to provide a secure and transparent social media platform for users. The application consists of several components: client, blockchain, API, server, and wallet.

## Table of Contents

- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Setup and Installation](#setup-and-installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
<!-- - [License](#license) -->

## Project Structure

- **client**: Contains the frontend code for the social media app.
- **blockchain**: Includes smart contracts and configuration files.
- **api**: Node.js APIs used by the application.
- **server**: Python code for plagiarism checking and detection.
- **wallet**: Flutter application code for the wallet functionality.

## Requirements

- **Node.js**: Ensure you have Node.js installed for the API.
- **Git**: Version Control
- **Python**: Required for the server-side plagiarism detection.
- **Flutter**: Needed for the wallet application.
- **Hardhat**: Required for managing smart contracts.
- **Android Phone**: Required for installing the mobile wallet app
<!-- - **MetaMask or Similar**: A browser extension or app for managing blockchain accounts. -->

## Setup and Installation

### Cloning the Repository

1. Clone the repository to your local machine using Git. Open your terminal and run the following command:
   ```bash
   git clone https://github.com/shrawank22/social_media_dapp.git
   ```
2. Navigate to the project directory:
   ```bash
   cd social_media_dapp
   ```

### Component Setup

For each component (client, api, blockchain, server, and wallet), open a new terminal and follow the corresponding instructions below:

#### Client

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

#### API

1. Navigate to the `api` directory:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

#### Blockchain

1. Navigate to the `blockchain` directory:
   ```bash
   cd blockchain
   ```
2. Install dependencies and set up the blockchain environment:
   ```bash
   npm install
   ```
3. Compile smart contracts:
   ```bash
   npx hardhat compile
   ```
4. Deploy smart contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network polygon
   ```

#### Server

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install Python dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```
3. After installing nltk, download the stopwords and punkt tokenizer models by opening a Python shell:
   ```python
   import nltk
   nltk.download('punkt')
   nltk.download('stopwords')
   ```

#### Wallet

1. Navigate to the `wallet` directory:
   ```bash
   cd wallet
   ```
2. Ensure Flutter is installed and set up.
3. Get Flutter packages:
   ```bash
   flutter pub get
   ```
4. Generate freezed files:
   ```bash
   flutter pub run build_runner build
   ```

## Environment Configuration

You need to create .env files in the client, api, and blockchain directories to store environment-specific variables. Here are the instructions for each:

### Client
1. Create a .env file in the client directory:
   ```bash
   touch .env
   ```
2. Add the necessary environment variables (replace placeholders with actual values):
   ```env
   VITE_PINATA_KEY=
   VITE_PINATA_SECRET_KEY=

   VITE_CONTRACT_ADDRESS=

   VITE_REACT_APP_VERIFICATION_SERVER_PUBLIC_URL=https://27c5-202-3-77-209.ngrok-free.app   # Update HOSTED_SERVER_URL with the ngrok url returned when you run `ngrok http ${SERVER_PORT}`
   VITE_REACT_APP_VERIFICATION_SERVER_LOCAL_HOST_URL=http://localhost:8080

   VITE_PUBLIC_PROJECT_ID=
   VITE_PUBLIC_RELAY_URL=wss://relay.walletconnect.com
   VITE_RPC_URL=
   ```

### API
1. Create a .env file in the api directory:
   ```bash
   touch .env
   ```
2. Add the necessary environment variables:
   ```env
   HOSTED_SERVER_URL=https://27c5-202-3-77-209.ngrok-free.app   # Update HOSTED_SERVER_URL with the ngrok url returned when you run `ngrok http ${SERVER_PORT}`
   RPC_URL_AMOY=

   VERIFIER_DID=
   ISSUER_DID=
   AMOY_CONTRACT_ADDRESS=
   BASIC_AUTH=

   FRONTEND_URL=http://localhost:5173
   HOSTED_ISSUER_URL=
   HOSTED_RESOLVER_URL=

   MONGODB_URI=
   SECRET=fdhvewuifhjweuhrfwe&&Q&WE007**%%%52dgyfh@^ghqdbhfewnjweuhqwegyqwevqhw
   CONTRACT_ADDRESS=
   API_KEY=
   ```

### Blockchain
1. Create a .env file in the blockchain directory:
   ```bash
   touch .env
   ```
2. Add the necessary environment variables:
   ```env
   PRIVATE_KEY=  # metamask account private key
   API_KEY=   # Alchemy/Infura API_Key
   ```
Make sure to replace the placeholder values with your actual configuration details.

### Ngrok Setup

   Ngrok is required to expose your local server to the internet. Follow these steps:
1. Install Ngrok from official website https://ngrok.com/
2. Start Ngrok and point it to your server port:
   ```bash
   ngrok http 8080
   ```
3. Copy the ngrok URL displayed in the terminal and update the client and api .env files. 

## Running the Application

In each terminal, navigate to the corresponding directory and run the appropriate command:

### Client

1. Start the frontend application:
   ```bash
   npm run dev
   ```

### API

1. Start the Node.js API server:
   ```bash
   npm start
   ```

### Server

1. Start the Python server:
   ```bash
   python3 app.py
   ```

### Wallet

1. Run the Flutter application:
   ```bash
   flutter run --dart-define=PROJECT_ID=xxx
   ```

## Contributing

Contributions are welcome! Please follow the standard [GitHub flow](https://guides.github.com/introduction/flow/) and ensure code is well-documented.