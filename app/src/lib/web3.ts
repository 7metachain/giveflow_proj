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
  campaignRegistry: '0xe50e3B162a3671fc758FcD53766C95582DF63ebF',
  proofRegistry: '0x47CE6C2Aa4BCd4F0b8991337DD14bd3C4b5d68c5',
  milestoneVault: '0x25c7f99292a87C31d94bd741770d33A8d87a7c87',
  batchDonate: '0xBAB71010e46DDf7B9E183d2C57753842d3cC5118',
} as const
