import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. Create QueryClient
const queryClient = new QueryClient();

// 2. Define chains
const chains = [mainnet, sepolia];

// 3. Wallet connectors
const { connectors } = getDefaultWallets({
  appName: "walletconnect",
  projectId: "5ce6c08905bb8e76e534b978151b1989", // your actual WC projectId
  chains,
});

// 4. Wagmi config
const config = createConfig({
  autoConnect: true,
  connectors,
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={chains}>
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
