"use client"

interface ProfileStatsProps {
  profile: any
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const badgeCount = profile.attendances?.length || 0
  const mintedCount = profile.attendances?.filter((a: any) => a.transaction_signature).length || 0
  const reputationScore = profile.reputation_score || 0

  // Calculate level based on reputation
  const level = Math.floor(reputationScore / 100) + 1
  const nextLevelThreshold = level * 100
  const progressToNextLevel = ((reputationScore % 100) / 100) * 100

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Reputation Card */}
      <div className="card">
        <h3 className="text-sm font-semibold text-foreground-muted mb-4">Reputation Level</h3>
        <div className="flex items-end gap-4">
          <div className="text-5xl font-bold text-primary">{level}</div>
          <div className="flex-1">
            <p className="text-2xl font-bold mb-2">{reputationScore}</p>
            <div className="w-full bg-surface-light rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
            <p className="text-xs text-foreground-muted mt-2">
              {nextLevelThreshold - reputationScore} points to level {level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Card */}
      <div className="card">
        <h3 className="text-sm font-semibold text-foreground-muted mb-4">Activity</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Events Attended</span>
            <span className="text-2xl font-bold text-primary">{badgeCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Badges Minted</span>
            <span className="text-2xl font-bold text-primary">{mintedCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground-muted">Mint Rate</span>
            <span className="text-2xl font-bold text-primary">
              {badgeCount > 0 ? Math.round((mintedCount / badgeCount) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
