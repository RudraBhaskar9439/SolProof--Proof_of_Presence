"use client"

import { useState } from "react"

interface LeaderboardTableProps {
  users: any[]
}

export default function LeaderboardTable({ users }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<"reputation" | "badges">("reputation")

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === "reputation") {
      return (b.reputation_score || 0) - (a.reputation_score || 0)
    } else {
      return (b.badge_count || 0) - (a.badge_count || 0)
    }
  })

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy("reputation")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === "reputation" ? "bg-primary text-background" : "bg-surface-light text-foreground hover:bg-surface"
          }`}
        >
          By Reputation
        </button>
        <button
          onClick={() => setSortBy("badges")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === "badges" ? "bg-primary text-background" : "bg-surface-light text-foreground hover:bg-surface"
          }`}
        >
          By Badges
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-light">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground-muted">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground-muted">User</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground-muted">Reputation</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground-muted">Badges</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground-muted">Minted</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, index) => {
                const medal = getMedalEmoji(index + 1)
                return (
                  <tr
                    key={user.wallet_address}
                    className="border-b border-surface-light hover:bg-surface-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">#{index + 1}</span>
                        {medal && <span className="text-xl">{medal}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{user.display_name || "Anonymous"}</p>
                        <p className="text-foreground-muted text-sm font-mono">
                          {user.wallet_address?.slice(0, 10)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-primary">{user.reputation_score || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold">{user.badge_count || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-accent">{user.minted_count || 0}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground-muted">No users on the leaderboard yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
