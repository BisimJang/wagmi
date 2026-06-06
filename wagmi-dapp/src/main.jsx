import React from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = Buffer;
window.process = process;

import App from "./App";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia, base, polygon, arbitrum, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { GoogleOAuthProvider } from '@react-oauth/google';

// Solana Wallet Adapter Imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

// 1. Create QueryClient
const queryClient = new QueryClient();

// 2. Define chains
const chains = [sepolia, mainnet, base, polygon, arbitrum, optimism];

// 3. Wallet connectors
const { connectors } = getDefaultWallets({
  appName: "Studyverse",
  projectId: "5ce6c08905bb8e76e534b978151b1989", // your actual WC projectId
  chains,
});

// 4. Wagmi config
import { fallback } from "viem";

// ... (existing code)

const config = createConfig({
  connectors,
  chains,
  transports: {
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [sepolia.id]: fallback([
      http(import.meta.env.VITE_SEPOLIA_RPC_URL),
      http('https://rpc.ankr.com/eth_sepolia'),
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://1rpc.io/sepolia')
    ]),
    [base.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";

// Solana Config
const solanaNetwork = clusterApiUrl('devnet');
const solanaWallets = []; // Modern Phantom auto-detects via Wallet Standard

ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider chains={chains}>
            <ConnectionProvider endpoint={solanaNetwork}>
              <WalletProvider wallets={solanaWallets} autoConnect>
                <WalletModalProvider>
                  <App />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
);

