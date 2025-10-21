"use client"

import { useState } from "react"
import { eventAPI } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

interface BadgeCardProps {
  badge: any
  onMinted?: () => void
}

export default function BadgeCard({ badge, onMinted }: BadgeCardProps) {
  const [minting, setMinting] = useState(false)
  const { toast } = useToast()

  const handleMintBadge = async () => {
    setMinting(true)
    try {
      const response = await eventAPI.mintBadge({
        attendanceId: badge.id,
        eventId: badge.event_id,
      })
      toast({
        title: "Success",
        description: "Badge minted successfully!",
      })
      onMinted?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to mint badge",
        variant: "destructive",
      })
    } finally {
      setMinting(false)
    }
  }

  const isMinted = !!badge.transaction_signature
  const eventName = badge.events?.event_name || "Event Badge"
  const eventDate = new Date(badge.checked_in_at).toLocaleDateString()
  const imageUrl = badge.events?.nft_image_url || "/nft-badge.jpg"

  return (
    <div className="card overflow-hidden hover:border-primary transition-all duration-200 flex flex-col">
      {/* Badge Image */}
      <div className="relative w-full h-48 bg-surface-light overflow-hidden rounded-lg mb-4">
        <img src={imageUrl || "/placeholder.svg"} alt={eventName} className="w-full h-full object-cover" />
        {isMinted && (
          <div className="absolute top-2 right-2 bg-primary text-background px-3 py-1 rounded-full text-xs font-semibold">
            Minted
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1 text-balance">{eventName}</h3>
        <p className="text-foreground-muted text-sm mb-4">{eventDate}</p>

        {/* Badge Details */}
        <div className="space-y-2 text-sm mb-4 flex-1">
          {badge.events?.description && (
            <p className="text-foreground-muted line-clamp-2">{badge.events.description}</p>
          )}
          {isMinted && (
            <div className="bg-surface-light rounded p-2 font-mono text-xs text-foreground-muted break-all">
              {badge.transaction_signature.slice(0, 20)}...
            </div>
          )}
        </div>

        {/* Mint Button */}
        {!isMinted && (
          <button onClick={handleMintBadge} disabled={minting} className="btn-primary w-full text-sm py-2">
            {minting ? "Minting..." : "Mint Badge"}
          </button>
        )}
        {isMinted && (
          <button
            disabled
            className="w-full px-4 py-2 bg-surface-light text-foreground-muted rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Badge Minted
          </button>
        )}
      </div>
    </div>
  )
}
