"use client"

import { useState, useEffect } from "react"
import { leaderboardAPI } from "@/lib/api/client"
import LeaderboardFilters from "@/components/leaderboard/leaderboard-filters"
import UserRankCard from "@/components/leaderboard/user-rank-card"
import LeaderboardTable from "@/components/leaderboard/leaderboard-table"
import { useToast } from "@/hooks/use-toast"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [timeframe, setTimeframe] = useState<"all-time" | "month" | "week">("all-time")
  const [sortBy, setSortBy] = useState<"reputation" | "badges">("reputation")
  const { toast } = useToast()

  useEffect(() => {
    loadLeaderboard()
  }, [timeframe, sortBy])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await leaderboardAPI.get(100)
      setLeaderboard(response.data.leaderboard || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-foreground-muted">Compete with other event attendees and build your reputation</p>
      </div>

      {/* Filters */}
      <LeaderboardFilters
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-foreground-muted">Loading leaderboard...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Cards */}
          {topThree.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6">Top Performers</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {topThree.map((user, index) => (
                  <UserRankCard key={user.wallet_address} user={user} rank={index + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div>
            <h2 className="text-xl font-bold mb-6">Full Rankings</h2>
            <LeaderboardTable users={leaderboard} />
          </div>
        </>
      )}
    </div>
  )
}
