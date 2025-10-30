"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import NotificationCenter from "@/components/notifications/notification-center"

export default function Navigation() {
  const { connected, publicKey } = useWalletConnection()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <nav className="bg-surface border-b border-surface-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-sm">PoP</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline">Proof of Presence</span>
            </Link>
            <div className="flex items-center gap-6">
              <div className="h-10 w-32 bg-surface-light animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-gradient-to-r from-[#50207A] to-[#3d1860] border-b border-[#FF48B9]/30 shadow-lg shadow-[#FF48B9]/20 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF48B9] to-[#50207A] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF48B9]/50">
              <span className="text-white font-bold text-sm">PoP</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline text-white">Proof of Presence</span>
          </Link>

          <div className="flex items-center gap-6">
            {connected && (
              <div className="flex gap-6">
                <Link href="/events" className="text-sm text-white/80 hover:text-white transition-colors font-medium">
                  Events
                </Link>
                <Link href="/profile" className="text-sm text-white/80 hover:text-white transition-colors font-medium">
                  Profile
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-sm text-white/80 hover:text-white transition-colors font-medium"
                >
                  Leaderboard
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2">
              {connected && <NotificationCenter />}
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
