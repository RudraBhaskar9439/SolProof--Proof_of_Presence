// "use client"

// import { useState, useEffect } from "react"
// import { useWalletConnection } from "@/lib/hooks/use-wallet"
// import EventCard from "@/components/events/event-card"
// import CreateEventModal from "@/components/events/create-event-modal"
// import { useToast } from "@/hooks/use-toast"

// export default function EventsPage() {
//   const { connected, publicKey } = useWalletConnection()
//   const [events, setEvents] = useState<any[]>([])
//   const [loading, setLoading] = useState(false)
//   const [showCreateModal, setShowCreateModal] = useState(false)
//   const { toast } = useToast()

//   useEffect(() => {
//     if (connected) {
//       loadEvents()
//     }
//   }, [connected])

//   const loadEvents = async () => {
//     setLoading(true)
//     try {
//       // In a real app, you'd fetch events from the backend
//       // For now, we'll show a placeholder
//       setEvents([])
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load events",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEventCreated = () => {
//     setShowCreateModal(false)
//     loadEvents()
//     toast({
//       title: "Success",
//       description: "Event created successfully",
//     })
//   }

//   if (!connected) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-12 text-center">
//         <p className="text-foreground-muted">Please connect your wallet to view events</p>
//       </div>
//     )
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">Events</h1>
//         <button onClick={() => setShowCreateModal(true)} className="btn-primary">
//           Create Event
//         </button>
//       </div>

//       {showCreateModal && (
//         <CreateEventModal
//           onClose={() => setShowCreateModal(false)}
//           onSuccess={handleEventCreated}
//           organizerWallet={publicKey!}
//         />
//       )}

//       {loading ? (
//         <div className="text-center py-12">
//           <p className="text-foreground-muted">Loading events...</p>
//         </div>
//       ) : events.length === 0 ? (
//         <div className="text-center py-12">
//           <p className="text-foreground-muted mb-4">No events yet</p>
//           <button onClick={() => setShowCreateModal(true)} className="btn-primary">
//             Create the first event
//           </button>
//         </div>
//       ) : (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {events.map((event) => (
//             <EventCard key={event.id} event={event} />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import EventDetailsModal from "@/components/events/event-details-modal"
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
}

export default function EventsPage() {
  const { connected, publicKey } = useWalletConnection()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Form state
  const [eventName, setEventName] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [location, setLocation] = useState("")
  const [maxAttendees, setMaxAttendees] = useState(100)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const response = await axios.get(`${API_URL}/api/events`)
      setEvents(response.data.events || [])
    } catch (error) {
      console.error("Failed to load events:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      alert("Please connect your wallet first")
      return
    }

    setCreating(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const eventId = `event_${Date.now()}`
      
      await axios.post(`${API_URL}/api/events`, {
        eventId,
        eventName,
        description,
        eventDate: new Date(eventDate).toISOString(),
        location,
        maxAttendees,
        organizerWallet: publicKey.toString(),
        metadataUri: `https://arweave.net/${eventId}`,
        nftImageUrl: `https://arweave.net/${eventId}/image.png`
      })

      alert("Event created successfully!")
      setShowCreateModal(false)
      resetForm()
      loadEvents()
    } catch (error: any) {
      console.error("Failed to create event:", error)
      alert(error.response?.data?.error || "Failed to create event")
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setEventName("")
    setDescription("")
    setEventDate("")
    setLocation("")
    setMaxAttendees(100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#50207A] via-[#3d1860] to-[#1a0a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Events</h1>
            <p className="text-foreground-muted">Browse and create events</p>
          </div>
          {connected && (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="btn-primary"
            >
              + Create Event
            </button>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-surface-light rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-surface-light rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-surface-light rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-foreground-muted mb-4">No events yet</p>
            {connected && (
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="btn-primary"
              >
                Create the first event
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="card hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">{event.event_name}</h3>
                  {event.is_active ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full">
                      Closed
                    </span>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-sm text-foreground-muted mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <span>📅</span>
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-foreground-muted">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <span>👥</span>
                    <span>{event.current_attendees} / {event.max_attendees} attendees</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-light">
                  <button 
                    onClick={() => setSelectedEvent(event)}
                    className="btn-primary w-full"
                  >
                    Join Event 🎉
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSuccess={() => {
              loadEvents() // Reload events to update attendance count
            }}
          />
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-surface-light rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Create New Event</h2>
                  <button 
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }} 
                    className="text-foreground-muted hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Name *</label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-surface-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Solana Breakpoint India 2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-surface-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Describe your event..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date *</label>
                    <input
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-surface-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-surface-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Bangalore, India"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Attendees *</label>
                    <input
                      type="number"
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-background border border-surface-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        resetForm()
                      }}
                      className="btn-secondary flex-1"
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                      disabled={creating}
                    >
                      {creating ? "Creating..." : "Create Event"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}