"use client"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

interface AchievementBadgesProps {
  profile: any
}

export default function AchievementBadges({ profile }: AchievementBadgesProps) {
  const achievements: Achievement[] = [
    {
      id: "first-event",
      name: "First Step",
      description: "Attend your first event",
      icon: "🎫",
      unlocked: (profile.attendances?.length || 0) >= 1,
      unlockedAt: profile.attendances?.[0]?.checked_in_at,
    },
    {
      id: "five-events",
      name: "Event Enthusiast",
      description: "Attend 5 events",
      icon: "🎯",
      unlocked: (profile.attendances?.length || 0) >= 5,
    },
    {
      id: "ten-events",
      name: "Event Master",
      description: "Attend 10 events",
      icon: "🏆",
      unlocked: (profile.attendances?.length || 0) >= 10,
    },
    {
      id: "five-minted",
      name: "NFT Collector",
      description: "Mint 5 badges",
      icon: "💎",
      unlocked: (profile.attendances?.filter((a: any) => a.transaction_signature).length || 0) >= 5,
    },
    {
      id: "reputation-100",
      name: "Rising Star",
      description: "Reach 100 reputation",
      icon: "⭐",
      unlocked: (profile.reputation_score || 0) >= 100,
    },
    {
      id: "reputation-500",
      name: "Legend",
      description: "Reach 500 reputation",
      icon: "👑",
      unlocked: (profile.reputation_score || 0) >= 500,
    },
  ]

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Achievements</h2>
        <p className="text-foreground-muted">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              achievement.unlocked ? "bg-surface-light border-primary" : "bg-surface border-surface-light opacity-50"
            }`}
          >
            <div className="text-3xl mb-2">{achievement.icon}</div>
            <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
            <p className="text-xs text-foreground-muted">{achievement.description}</p>
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-primary mt-2">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
