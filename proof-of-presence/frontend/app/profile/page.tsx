"use client"

import { useState, useEffect } from "react"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import axios from "axios"

interface Badge {
  event_name: string
  event_date: string
  location: string
  checked_in_at: string
  nft_mint: string
}

interface Profile {
  wallet_address: string
  username: string
  total_badges: number
  reputation_score: number
  attended_events: Badge[]
}

export default function ProfilePage() {
  const { connected, publicKey } = useWalletConnection()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    if (connected && publicKey) {
      loadProfile()
    }
  }, [connected, publicKey])

  const loadProfile = async () => {
    if (!publicKey) return
    
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const response = await axios.get(`${API_URL}/api/profile/${publicKey.toString()}`)
      setProfile(response.data.profile)
      setUsername(response.data.profile.username || "")
    } catch (error: any) {
      console.error("Failed to load profile:", error)
      // Create default profile if doesn't exist
      setProfile({
        wallet_address: publicKey.toString(),
        username: "Anonymous",
        total_badges: 0,
        reputation_score: 0,
        attended_events: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!publicKey) return
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const response = await axios.put(`${API_URL}/api/profile/update`, {
        walletAddress: publicKey.toString(),
        displayName: username,
        bio: null,
        avatarUrl: null
      })

      if (response.data.success) {
        setProfile({
          ...profile!,
          username: username
        })
        setEditing(false)
        alert("Profile updated successfully!")
        loadProfile()
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#50207A] via-[#3d1860] to-[#1a0a2e]">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="card max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <p className="text-foreground-muted mb-6">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#50207A] via-[#3d1860] to-[#1a0a2e]">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-light rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-surface-light rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#50207A] via-[#3d1860] to-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl font-bold text-background">
                {profile?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile?.username || "Anonymous"}</h1>
                <p className="text-sm text-foreground-muted font-mono">
                  {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setEditing(!editing)} 
              className="btn-secondary"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {editing && (
            <div className="mt-6 pt-6 border-t border-surface-light">
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-surface-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter username"
              />
              <button 
                onClick={handleUpdateProfile} 
                className="btn-primary mt-4"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-primary text-3xl mb-2">🎫</div>
            <div className="text-3xl font-bold mb-1">{profile?.total_badges || 0}</div>
            <div className="text-sm text-foreground-muted">Total Badges</div>
          </div>
          <div className="card">
            <div className="text-primary text-3xl mb-2">⭐</div>
            <div className="text-3xl font-bold mb-1">{profile?.reputation_score || 0}</div>
            <div className="text-sm text-foreground-muted">Reputation Score</div>
          </div>
          <div className="card">
            <div className="text-primary text-3xl mb-2">🏆</div>
            <div className="text-3xl font-bold mb-1">
              {profile?.reputation_score ? Math.floor(profile.reputation_score / 100) : 0}
            </div>
            <div className="text-sm text-foreground-muted">Level</div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Event Badges</h2>
          {profile?.attended_events && profile.attended_events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.attended_events.map((badge, index) => (
                <div key={index} className="bg-surface border border-surface-light rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="text-4xl mb-3">🎖️</div>
                  <h3 className="font-semibold mb-2">{badge.event_name}</h3>
                  <p className="text-sm text-foreground-muted mb-1">
                    📍 {badge.location || "Virtual"}
                  </p>
                  <p className="text-sm text-foreground-muted mb-2">
                    📅 {new Date(badge.event_date).toLocaleDateString()}
                  </p>
                  {badge.nft_mint && (
                    <p className="text-xs text-primary font-mono truncate">
                      NFT: {badge.nft_mint.slice(0, 8)}...{badge.nft_mint.slice(-8)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-foreground-muted mb-4">No badges yet</p>
              <p className="text-sm text-foreground-muted">Attend events to earn your first badge!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
