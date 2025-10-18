// frontend/src/pages/Home.tsx
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <Navbar />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">Proof of Presence</h1>
          <p className="text-xl text-gray-300 mb-8">Event check-in, NFT badges, and reputation on Solana</p>
        </div>
        {publicKey ? (
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        ) : (
          <p className="text-lg text-gray-400">Connect your wallet to get started</p>
        )}
      </section>
      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Proof of Presence?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon={null} title="Secure Event Check-In" description="Verify attendance with Solana wallet and QR codes." />
          <FeatureCard icon={null} title="NFT Badges" description="Earn unique NFT badges for every event you attend." />
          <FeatureCard icon={null} title="Reputation & Leaderboard" description="Build your reputation and climb the leaderboard." />
        </div>
      </section>
      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold">100+</h3>
            <p className="text-gray-400">Events Hosted</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">500+</h3>
            <p className="text-gray-400">NFT Badges Minted</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">1000+</h3>
            <p className="text-gray-400">Check-ins</p>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to join the next event?</h2>
        <button
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition"
          onClick={() => navigate('/dashboard')}
        >
          Explore Dashboard
        </button>
      </section>
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-400">
        &copy; {new Date().getFullYear()} Proof of Presence. Built on Solana.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
      <div className="bg-purple-600/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-purple-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}