"use client"

interface UserRankCardProps {
  user: any
  rank: number
}

export default function UserRankCard({ user, rank }: UserRankCardProps) {
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  const medal = getMedalEmoji(rank)

  return (
    <div className="card hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-lg font-bold text-background">
            {rank}
          </div>
          {medal && <span className="text-2xl">{medal}</span>}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{user.reputation_score || 0}</p>
          <p className="text-xs text-foreground-muted">reputation</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-1">{user.display_name || "Anonymous"}</h3>
        <p className="text-foreground-muted text-sm font-mono">{user.wallet_address?.slice(0, 12)}...</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-surface-light">
        <div>
          <p className="text-xs text-foreground-muted">Badges</p>
          <p className="text-lg font-bold">{user.badge_count || 0}</p>
        </div>
        <div>
          <p className="text-xs text-foreground-muted">Minted</p>
          <p className="text-lg font-bold">{user.minted_count || 0}</p>
        </div>
      </div>
    </div>
  )
}
