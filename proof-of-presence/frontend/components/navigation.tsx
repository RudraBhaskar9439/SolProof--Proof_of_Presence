"use client"

import Link from "next/link"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import NotificationCenter from "@/components/notifications/notification-center"

export default function Navigation() {
  const { connected, publicKey } = useWalletConnection()

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
            {connected && (
              <div className="flex gap-6">
                <Link href="/events" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                  Events
                </Link>
                <Link href="/profile" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                  Profile
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors"
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
