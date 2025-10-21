"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useCallback } from "react"

export function useWalletConnection() {
  const { publicKey, connected, connect, disconnect, wallet } = useWallet()

  const connectWallet = useCallback(async () => {
    if (!connected && wallet) {
      try {
        await connect()
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      }
    }
  }, [connected, connect, wallet])

  const disconnectWallet = useCallback(async () => {
    if (connected) {
      try {
        await disconnect()
      } catch (error) {
        console.error("Failed to disconnect wallet:", error)
      }
    }
  }, [connected, disconnect])

  return {
    publicKey: publicKey?.toString(),
    connected,
    connectWallet,
    disconnectWallet,
    wallet,
  }
}
