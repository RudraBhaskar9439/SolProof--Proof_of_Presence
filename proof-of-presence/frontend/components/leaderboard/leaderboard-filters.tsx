"use client"

interface LeaderboardFiltersProps {
  timeframe: "all-time" | "month" | "week"
  onTimeframeChange: (timeframe: "all-time" | "month" | "week") => void
  sortBy: "reputation" | "badges"
  onSortChange: (sortBy: "reputation" | "badges") => void
}

export default function LeaderboardFilters({
  timeframe,
  onTimeframeChange,
  sortBy,
  onSortChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="card mb-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeframe Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Timeframe</h3>
          <div className="flex gap-2">
            {(["week", "month", "all-time"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === tf ? "bg-primary text-background" : "bg-surface-light text-foreground hover:bg-surface"
                }`}
              >
                {tf === "week" ? "This Week" : tf === "month" ? "This Month" : "All Time"}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Sort By</h3>
          <div className="flex gap-2">
            {(["reputation", "badges"] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => onSortChange(sort)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === sort ? "bg-primary text-background" : "bg-surface-light text-foreground hover:bg-surface"
                }`}
              >
                {sort === "reputation" ? "Reputation" : "Badges"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
