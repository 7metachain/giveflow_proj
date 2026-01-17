import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Define Monad Testnet chain
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
} as const

// RainbowKit config
export const config = getDefaultConfig({
  appName: 'GiveFlow',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [monadTestnet, sepolia],
  ssr: true,
})

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  campaignRegistry: '0x0000000000000000000000000000000000000000',
  proofRegistry: '0x286b89AD07C6450d5BF26ac98cC46A4ea6332093',
  milestoneVault: '0x6b3Bde35C66D766E0FDE7DBB66c1A1b8C9809a1F',
  batchDonate: '0x0000000000000000000000000000000000000000',
} as const
