"use client"

import { useState } from "react"
import BadgeCard from "./badge-card"

interface BadgesListProps {
  badges: any[]
  onBadgeMinted?: () => void
}

export default function BadgesList({ badges, onBadgeMinted }: BadgesListProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const mintedBadges = badges.filter((b) => !!b.transaction_signature)
  const unmintedBadges = badges.filter((b) => !b.transaction_signature)

  const handleBadgeMinted = () => {
    setRefreshKey((prev) => prev + 1)
    onBadgeMinted?.()
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Event Badges</h2>
        <p className="text-foreground-muted">
          {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
          {mintedBadges.length > 0 && ` • ${mintedBadges.length} minted`}
        </p>
      </div>

      {badges.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🎫</div>
          <p className="text-foreground-muted">No badges yet. Attend events to earn badges!</p>
        </div>
      ) : (
        <>
          {/* Unminted Badges Section */}
          {unmintedBadges.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-4 text-foreground-muted">Ready to Mint</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unmintedBadges.map((badge) => (
                  <BadgeCard key={`${badge.id}-${refreshKey}`} badge={badge} onMinted={handleBadgeMinted} />
                ))}
              </div>
            </div>
          )}

          {/* Minted Badges Section */}
          {mintedBadges.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground-muted">Minted Badges</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mintedBadges.map((badge) => (
                  <BadgeCard key={`${badge.id}-${refreshKey}`} badge={badge} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
