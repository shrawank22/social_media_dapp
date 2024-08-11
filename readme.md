
## Setup and Installation

### Component Setup

For each component (client, api), open a new terminal and follow the corresponding instructions below:

#### ngrok setup for client and api

1. Install ngrok from the official website: https://ngrok.com/download
2. Start ngrok and point it to the client and api ports:
   ```bash
   ngrok config add-authtoken 2RKINo5WgwVPrYUrgHn858Bo4IC_6Xc1h7bKPuG4pb1ZrfCdr

   ngrok http 8080
   ```
3. Copy the ngrok URL displayed in the terminal and update the `HOSTED_SERVER_URL` in `/api/.env` and `VITE_REACT_APP_VERIFICATION_SERVER_PUBLIC_URL` in `/client/.env` with the same ngrok URL.

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
   npm api install
   ```

### Running the Application

#### Wallet

1. Login to the website `http://localhost:5173/logout`
2. Scan using Crypto Wallet QR code to connect to the wallet

```bash
If crypto wallet connect breaks, go to `http://localhost:5173/logout` and go to Login page again scan the QR code
```