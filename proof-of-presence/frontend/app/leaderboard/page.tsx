"use client"

import { useState, useEffect } from "react"
import axios from "axios"

interface LeaderboardUser {
  rank: number
  wallet_address: string
  username: string
  total_badges: number
  reputation_score: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const response = await axios.get(`${API_URL}/api/leaderboard?limit=100`)
      setLeaderboard(response.data.leaderboard || [])
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return ""
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#50207A] via-[#3d1860] to-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-foreground-muted">Compete with other event attendees and build your reputation</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-surface-light rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-surface-light rounded w-32 mx-auto"></div>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-foreground-muted mb-4">No users on the leaderboard yet</p>
            <p className="text-sm text-foreground-muted">Be the first to attend an event and earn reputation!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Top Performers</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {topThree.map((user) => (
                    <div 
                      key={user.wallet_address} 
                      className={`card relative overflow-hidden ${
                        user.rank === 1 ? 'border-yellow-500' : 
                        user.rank === 2 ? 'border-gray-400' : 
                        'border-orange-600'
                      }`}
                    >
                      <div className="absolute top-0 right-0 text-6xl opacity-10">
                        {getMedalEmoji(user.rank)}
                      </div>
                      <div className="relative z-10">
                        <div className="text-5xl mb-4">{getMedalEmoji(user.rank)}</div>
                        <div className="text-4xl font-bold mb-2">#{user.rank}</div>
                        <h3 className="text-xl font-bold mb-1">{user.username || "Anonymous"}</h3>
                        <p className="text-xs text-foreground-muted font-mono mb-4">
                          {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-8)}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-surface-light">
                          <div>
                            <div className="text-2xl font-bold text-primary">{user.reputation_score}</div>
                            <div className="text-xs text-foreground-muted">XP</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-primary">{user.total_badges}</div>
                            <div className="text-xs text-foreground-muted">Badges</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Full Rankings</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-light">
                      <th className="text-left py-3 px-4 font-semibold">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold">User</th>
                      <th className="text-right py-3 px-4 font-semibold">Reputation</th>
                      <th className="text-right py-3 px-4 font-semibold">Badges</th>
                      <th className="text-right py-3 px-4 font-semibold">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((user, index) => (
                      <tr 
                        key={user.wallet_address} 
                        className="border-b border-surface-light hover:bg-surface-light/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{user.rank}</span>
                            {user.rank <= 3 && (
                              <span className="text-2xl">{getMedalEmoji(user.rank)}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold">{user.username || "Anonymous"}</div>
                            <div className="text-xs text-foreground-muted font-mono">
                              {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-8)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-lg font-bold text-primary">{user.reputation_score}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-lg font-bold">{user.total_badges}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-lg font-bold">
                            {Math.floor(user.reputation_score / 100)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
