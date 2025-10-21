"use client"

import type React from "react"

import { useState } from "react"
import { eventAPI } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

interface CreateEventModalProps {
  onClose: () => void
  onSuccess: () => void
  organizerWallet: string
}

export default function CreateEventModal({ onClose, onSuccess, organizerWallet }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    eventId: "",
    eventName: "",
    description: "",
    eventDate: "",
    location: "",
    maxAttendees: "100",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await eventAPI.create({
        ...formData,
        organizerWallet,
        maxAttendees: Number.parseInt(formData.maxAttendees),
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event ID"
            className="input-field"
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Event Name"
            className="input-field"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            required
          />

          <textarea
            placeholder="Description"
            className="input-field"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <input
            type="datetime-local"
            className="input-field"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Location"
            className="input-field"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <input
            type="number"
            placeholder="Max Attendees"
            className="input-field"
            value={formData.maxAttendees}
            onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
