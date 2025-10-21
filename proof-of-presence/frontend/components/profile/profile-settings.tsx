"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProfileSettingsProps {
  profile: any
  onClose: () => void
  onSave: () => void
}

export default function ProfileSettings({ profile, onClose, onSave }: ProfileSettingsProps) {
  const [settings, setSettings] = useState({
    displayName: profile.display_name || "",
    bio: profile.bio || "",
    showOnLeaderboard: profile.show_on_leaderboard !== false,
    emailNotifications: profile.email_notifications !== false,
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      // API call would go here
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              className="input-field"
              value={settings.displayName}
              onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
              placeholder="Your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              className="input-field"
              value={settings.bio}
              onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3 pt-4 border-t border-surface-light">
            <h3 className="font-semibold">Privacy & Notifications</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showOnLeaderboard}
                onChange={(e) => setSettings({ ...settings, showOnLeaderboard: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Show on leaderboard</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Email notifications</span>
            </label>
          </div>

          {/* Wallet Info */}
          <div className="pt-4 border-t border-surface-light">
            <h3 className="font-semibold mb-2">Connected Wallet</h3>
            <p className="text-sm font-mono text-foreground-muted break-all">{profile.wallet_address}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-surface-light mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
