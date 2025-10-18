// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './lib/wallet/WalletProvider';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/Home';
import ProfilePage from './pages/page';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/profile/:wallet" element={<ProfilePage />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </WalletProvider>
  );
}

export default App;