"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import axios from "axios"

interface Event {
  id: string
  event_id: string
  event_name: string
  description: string
  event_date: string
  location: string
  max_attendees: number
  current_attendees: number
  organizer_wallet: string
  is_active: boolean
  metadata_uri?: string
  nft_image_url?: string
}

interface EventDetailsModalProps {
  event: Event
  onClose: () => void
  onSuccess: () => void
}

export default function EventDetailsModal({ event, onClose, onSuccess }: EventDetailsModalProps) {
  const { connected, publicKey, signTransaction } = useWallet()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinEvent = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first")
      return
    }

    if (!event.is_active) {
      setError("This event is no longer active")
      return
    }

    if (event.current_attendees >= event.max_attendees) {
      setError("This event has reached maximum capacity")
      return
    }

    setJoining(true)
    setError(null)

    try {
      // Generate a simple signature for free events
      // Format: wallet_eventId_timestamp (creates unique 88-char signature)
      const timestamp = Date.now()
      const signatureData = `${publicKey.toString()}_${event.event_id}_${timestamp}`
      const mockSignature = Buffer.from(signatureData).toString('base64').padEnd(88, '=').slice(0, 88)

      // Call backend API to register attendance (no blockchain transaction needed for free events)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      console.log("📝 Joining event (free entry)...")
      
      const response = await axios.post(`${API_URL}/api/events/mint-badge`, {
        eventId: event.event_id,
        attendeeWallet: publicKey.toString(),
        transactionSignature: mockSignature,
        nftMint: null,
        nftTokenAccount: null,
        metadataUri: event.metadata_uri || null
      })

      if (response.data.success) {
        alert(`✅ Successfully joined ${event.event_name}! 🎉\n\n⭐ You've earned 10 reputation points!\n\n🎫 Check your profile to see your badge!`)
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      console.error("❌ Failed to join event:", error)
      
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error
        setError(errorMessage)
        if (errorMessage.includes("already checked in")) {
          alert("⚠️ You have already joined this event!")
        }
      } else if (error.message) {
        setError(error.message)
      } else {
        setError("Failed to join event. Please try again.")
      }
    } finally {
      setJoining(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const spotsLeft = event.max_attendees - event.current_attendees
  const isFull = spotsLeft <= 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-surface-light rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{event.event_name}</h2>
                {event.is_active ? (
                  <span className="px-3 py-1 bg-green-500/20 text-green-500 text-sm rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-500 text-sm rounded-full">
                    Closed
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground-muted">
                Organized by {event.organizer_wallet.slice(0, 8)}...{event.organizer_wallet.slice(-8)}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-foreground-muted hover:text-foreground text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Event Image/Icon */}
          <div className="mb-6 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg p-12 text-center">
            <div className="text-8xl mb-4">🎫</div>
            <p className="text-sm text-foreground-muted">Event Badge NFT</p>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-6">
            {event.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground-muted mb-2">Description</h3>
                <p className="text-foreground">{event.description}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground-muted mb-2">📅 Date & Time</h3>
                <p className="text-foreground">{formatDate(event.event_date)}</p>
              </div>

              {event.location && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground-muted mb-2">📍 Location</h3>
                  <p className="text-foreground">{event.location}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground-muted mb-2">👥 Attendance</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="bg-surface-light rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all"
                      style={{ width: `${(event.current_attendees / event.max_attendees) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-bold">{event.current_attendees}</span>
                  <span className="text-foreground-muted"> / {event.max_attendees}</span>
                </div>
              </div>
              {isFull ? (
                <p className="text-sm text-red-500 mt-2">⚠️ Event is full</p>
              ) : spotsLeft <= 10 ? (
                <p className="text-sm text-yellow-500 mt-2">⚠️ Only {spotsLeft} spots left!</p>
              ) : (
                <p className="text-sm text-green-500 mt-2">✓ {spotsLeft} spots available</p>
              )}
            </div>

            {/* Rewards Info */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">🎁 Free Event - Join Instantly!</h3>
              <ul className="text-sm space-y-1 text-foreground-muted">
                <li>✓ Exclusive Event Badge</li>
                <li>✓ +10 Reputation Points</li>
                <li>✓ Appear on Leaderboard</li>
                <li>✓ No transaction fee required</li>
              </ul>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Wallet Connection Status */}
          {!connected && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm">
              ⚠️ Please connect your wallet to join this event
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={joining}
            >
              Cancel
            </button>
            <button
              onClick={handleJoinEvent}
              className="btn-primary flex-1"
              disabled={joining || !connected || !event.is_active || isFull}
            >
              {joining ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Joining...
                </>
              ) : isFull ? (
                "Event Full"
              ) : !event.is_active ? (
                "Event Closed"
              ) : !connected ? (
                "Connect Wallet First"
              ) : (
                "Join Event 🎉"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
