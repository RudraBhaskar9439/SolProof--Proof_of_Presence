"use client"

import { useState } from "react"
import { profileAPI } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

interface ProfileHeaderProps {
  profile: any
  onEdit: () => void
  onProfileUpdated: () => void
}

export default function ProfileHeader({ profile, onEdit, onProfileUpdated }: ProfileHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile.display_name || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await profileAPI.update({
        displayName,
        bio,
      })
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setEditing(false)
      onProfileUpdated()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const reputationScore = profile.reputation_score || 0
  const badgeCount = profile.attendances?.length || 0

  return (
    <div className="card mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-2xl font-bold text-background">
              {profile.display_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.display_name || "Anonymous User"}</h1>
              <p className="text-foreground-muted text-sm font-mono">{profile.wallet_address?.slice(0, 10)}...</p>
            </div>
          </div>
          {profile.bio && <p className="text-foreground-muted">{profile.bio}</p>}
        </div>

        <button onClick={() => setEditing(!editing)} className="btn-secondary">
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pt-6 border-t border-surface-light">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{badgeCount}</div>
          <p className="text-foreground-muted text-sm">Badges Earned</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{reputationScore}</div>
          <p className="text-foreground-muted text-sm">Reputation Score</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {profile.attendances?.filter((a: any) => a.transaction_signature).length || 0}
          </div>
          <p className="text-foreground-muted text-sm">Minted Badges</p>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="space-y-4 pt-6 border-t border-surface-light">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              className="input-field"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditing(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
