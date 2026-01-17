'use client'

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, keccak256, toBytes } from 'viem'
import { contractConfig } from '@/lib/contracts'
import { monadTestnet } from '@/lib/web3'

// Hook for donating to a campaign
export function useDonate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const donate = async (campaignId: number, amount: string) => {
    writeContract({
      address: contractConfig.campaignRegistry.address as `0x${string}`,
      abi: contractConfig.campaignRegistry.abi,
      functionName: 'donate',
      args: [BigInt(campaignId)],
      value: parseEther(amount),
      chain: monadTestnet,
    })
  }

  return {
    donate,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Hook for submitting a proof
export function useSubmitProof() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const submitProof = async (
    campaignId: number,
    milestoneId: number,
    proofContent: string, // Content to hash
    amount: string,
    ipfsUri: string
  ) => {
    // Generate proof hash from content
    const proofHash = keccak256(toBytes(proofContent))
    
    writeContract({
      address: contractConfig.proofRegistry.address as `0x${string}`,
      abi: contractConfig.proofRegistry.abi,
      functionName: 'submitProof',
      args: [
        BigInt(campaignId),
        BigInt(milestoneId),
        proofHash,
        parseEther(amount),
        ipfsUri,
      ],
      chain: monadTestnet,
    })
  }

  return {
    submitProof,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Hook for withdrawing with proof
export function useWithdrawWithProof() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const withdraw = async (
    campaignId: number,
    milestoneId: number,
    proofId: number
  ) => {
    writeContract({
      address: contractConfig.milestoneVault.address as `0x${string}`,
      abi: contractConfig.milestoneVault.abi,
      functionName: 'withdrawWithProof',
      args: [BigInt(campaignId), BigInt(milestoneId), BigInt(proofId)],
      chain: monadTestnet,
    })
  }

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Hook for reading campaign data
export function useCampaign(campaignId: number) {
  return useReadContract({
    address: contractConfig.campaignRegistry.address as `0x${string}`,
    abi: contractConfig.campaignRegistry.abi,
    functionName: 'getCampaign',
    args: [BigInt(campaignId)],
  })
}

// Hook for checking if proof is approved
export function useIsProofApproved(proofId: number) {
  return useReadContract({
    address: contractConfig.proofRegistry.address as `0x${string}`,
    abi: contractConfig.proofRegistry.abi,
    functionName: 'isProofApproved',
    args: [BigInt(proofId)],
  })
}

// Hook for getting campaign balance
export function useCampaignBalance(campaignId: number) {
  return useReadContract({
    address: contractConfig.milestoneVault.address as `0x${string}`,
    abi: contractConfig.milestoneVault.abi,
    functionName: 'getCampaignBalance',
    args: [BigInt(campaignId)],
  })
}
