"use client"

import { useState, useEffect } from "react"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import { profileAPI } from "@/lib/api/client"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileStats from "@/components/profile/profile-stats"
import AchievementBadges from "@/components/profile/achievement-badges"
import BadgesList from "@/components/profile/badges-list"
import ProfileSettings from "@/components/profile/profile-settings"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { connected, publicKey } = useWalletConnection()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (connected && publicKey) {
      loadProfile()
    }
  }, [connected, publicKey])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await profileAPI.get(publicKey!)
      setProfile(response.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-foreground-muted">Please connect your wallet to view your profile</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-foreground-muted">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {profile && (
        <>
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <ProfileHeader profile={profile} onEdit={() => {}} onProfileUpdated={loadProfile} />
            </div>
            <button onClick={() => setShowSettings(true)} className="btn-secondary ml-4">
              Settings
            </button>
          </div>

          <ProfileStats profile={profile} />
          <AchievementBadges profile={profile} />

          {/* Badges Section */}
          <div className="mt-8">
            <BadgesList badges={profile.attendances || []} onBadgeMinted={loadProfile} />
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <ProfileSettings
              profile={profile}
              onClose={() => setShowSettings(false)}
              onSave={() => {
                setShowSettings(false)
                loadProfile()
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
