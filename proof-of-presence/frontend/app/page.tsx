"use client"

import Link from "next/link"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function Home() {
  const { connected } = useWalletConnection()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-balance">
                Proof of <span className="text-primary">Presence</span>
              </h1>
              <p className="text-xl text-foreground-muted">
                Attend events, mint NFT badges, and build your reputation on Solana. A decentralized event check-in
                system powered by blockchain.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {connected ? (
                <>
                  <Link href="/events" className="btn-primary text-center">
                    Browse Events
                  </Link>
                  <Link href="/profile" className="btn-secondary text-center">
                    View Profile
                  </Link>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <WalletMultiButton />
                  <p className="text-foreground-muted text-sm self-center">Connect your wallet to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4">
            <div className="card">
              <div className="text-primary text-3xl mb-3">🎫</div>
              <h3 className="font-semibold text-lg mb-2">Create Events</h3>
              <p className="text-foreground-muted text-sm">
                Organizers can create events and generate secure QR codes for check-in.
              </p>
            </div>
            <div className="card">
              <div className="text-primary text-3xl mb-3">✓</div>
              <h3 className="font-semibold text-lg mb-2">Check In</h3>
              <p className="text-foreground-muted text-sm">
                Attendees scan QR codes to verify their presence at events.
              </p>
            </div>
            <div className="card">
              <div className="text-primary text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-lg mb-2">Earn Badges</h3>
              <p className="text-foreground-muted text-sm">
                Mint NFT badges and build your reputation score on the leaderboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
