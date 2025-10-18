// frontend/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { profileApi } from '../lib/api/profile';
import { Award, Star, Calendar, MapPin, Trophy, TrendingUp } from 'lucide-react';
import type { UserProfile } from '../types';

export default function ProfilePage() {
  const { wallet } = useParams<{ wallet: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'stats'>('badges');

  useEffect(() => {
    if (wallet) {
      fetchProfile();
    }
  }, [wallet]);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.get(wallet!);
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl font-bold">
              {profile?.display_name?.[0] || wallet?.[0]}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {profile?.display_name || 'Anonymous User'}
              </h1>
              <p className="text-gray-300 mb-3">{profile?.bio || 'Web3 enthusiast'}</p>
              <p className="text-sm text-gray-400 font-mono">
                {wallet?.slice(0, 4)}...{wallet?.slice(-4)}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatBox
              icon={<Award className="w-5 h-5 text-purple-400" />}
              label="Badges"
              value={profile?.total_badges || 0}
            />
            <StatBox
              icon={<Star className="w-5 h-5 text-yellow-400" />}
              label="Reputation XP"
              value={profile?.reputation_score || 0}
            />
            <StatBox
              icon={<Trophy className="w-5 h-5 text-orange-400" />}
              label="Rank"
              value="#--"
            />
            <StatBox
              icon={<TrendingUp className="w-5 h-5 text-green-400" />}
              label="Events"
              value={profile?.attendances?.length || 0}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'badges'
                ? 'bg-purple-600'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Badge Collection
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'stats'
                ? 'bg-purple-600'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Badge Collection */}
        {activeTab === 'badges' && (
          <div>
            {!profile?.attendances || profile.attendances.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
                <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl text-gray-300">No badges yet</p>
                <p className="text-gray-400 mt-2">Attend events to collect badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.attendances.map((attendance, index) => (
                  <BadgeCard key={index} attendance={attendance} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Activity Timeline</h3>
              <div className="space-y-3">
                {profile?.attendances?.slice(0, 5).map((attendance, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-gray-400">
                      {new Date(attendance.checked_in_at).toLocaleDateString()}
                    </span>
                    <span className="flex-1">{attendance.events?.event_name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Next Level Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Level {Math.floor((profile?.reputation_score || 0) / 100)}</span>
                  <span>Level {Math.floor((profile?.reputation_score || 0) / 100) + 1}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                    style={{ width: `${((profile?.reputation_score || 0) % 100)}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-400 mt-2">
                  {100 - ((profile?.reputation_score || 0) % 100)} XP remaining
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: any) {
  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function BadgeCard({ attendance }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border-2 border-purple-500/50 hover:scale-105 transition-transform">
      <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
        <Award className="w-24 h-24 text-white" />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{attendance.events?.event_name || 'Event'}</h3>

        <div className="space-y-1 text-sm text-gray-400 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(attendance.events?.event_date || attendance.checked_in_at).toLocaleDateString()}
          </div>
          {attendance.events?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {attendance.events.location}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold">+10 XP</span>
          </div>
          <span className="text-xs text-purple-400">Verified</span>
        </div>
      </div>
    </div>
  );
}