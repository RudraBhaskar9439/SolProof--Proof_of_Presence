// frontend/src/components/Navbar.tsx
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { QrCode, User, LayoutDashboard, Home } from 'lucide-react';

export default function Navbar() {
  const { publicKey } = useWallet();

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block">Proof of Presence</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:block">Home</span>
            </Link>

            {publicKey && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:block">Dashboard</span>
                </Link>

                <Link
                  to="/scan"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:block">Scan</span>
                </Link>

                <Link
                  to={`/profile/${publicKey.toBase58()}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">Profile</span>
                </Link>
              </>
            )}

            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
}