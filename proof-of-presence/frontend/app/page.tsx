"use client"

import Link from "next/link"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function Home() {
  const { connected } = useWalletConnection()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#50207A] via-[#3d1860] to-[#1a0a2e]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
            Proof of Presence on{" "}
            <span className="gradient-text">
              Solana
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-10 leading-relaxed" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>
            Attend events, collect NFT badges, and build your on-chain reputation
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            {connected ? (
              <>
                <Link href="/events" className="btn-primary text-lg w-full sm:w-auto">
                  🎉 Explore Events
                </Link>
                <Link href="/leaderboard" className="btn-secondary text-lg w-full sm:w-auto">
                  🏆 View Leaderboard
                </Link>
                <Link href="/profile" className="btn-secondary text-lg w-full sm:w-auto">
                  👤 My Profile
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <WalletMultiButton className="!bg-gradient-to-r !from-[#50207A] !to-[#FF48B9]" />
                <p className="text-white text-base" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>Connect your wallet to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card text-center group">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🎫</div>
            <h3 className="text-2xl font-bold mb-4 text-white" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>Collect Badges</h3>
            <p className="text-white text-base leading-relaxed" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>
              Earn unique NFT badges for every event you attend
            </p>
          </div>
          <div className="card text-center group">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🔗</div>
            <h3 className="text-2xl font-bold mb-4 text-white" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>On-Chain Proof</h3>
            <p className="text-white text-base leading-relaxed" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>
              All attendance verified and stored on Solana blockchain
            </p>
          </div>
          <div className="card text-center group">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">⭐</div>
            <h3 className="text-2xl font-bold mb-4 text-white" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>Build Reputation</h3>
            <p className="text-white text-base leading-relaxed" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>
              Gain reputation points and climb the leaderboard
            </p>
          </div>
        </div>

        {/* Call to Action Section */}
        {!connected && (
          <div className="mt-20 text-center">
            <div className="card max-w-2xl mx-auto bg-gradient-to-br from-[#50207A]/10 to-[#FF48B9]/10 border-[#FF48B9] glow-effect">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Ready to Get Started?</h2>
              <p className="text-white text-lg mb-6" style={{textShadow: '0 0 20px rgba(255, 128, 208, 0.3)'}}>
                Join thousands of users building their on-chain reputation
              </p>
              <WalletMultiButton className="!bg-gradient-to-r !from-[#50207A] !to-[#FF48B9] !text-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
