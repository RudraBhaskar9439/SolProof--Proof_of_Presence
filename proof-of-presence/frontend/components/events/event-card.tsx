"use client"

import Link from "next/link"

interface EventCardProps {
  event: any
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="card hover:border-primary transition-colors cursor-pointer">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{event.event_name}</h3>
        <p className="text-foreground-muted text-sm">{event.description}</p>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <p className="text-foreground-muted">📅 {new Date(event.event_date).toLocaleDateString()}</p>
        <p className="text-foreground-muted">📍 {event.location}</p>
        <p className="text-foreground-muted">
          👥 {event.current_attendees}/{event.max_attendees} attendees
        </p>
      </div>

      <Link href={`/events/${event.id}`} className="btn-secondary w-full text-center block">
        View Details
      </Link>
    </div>
  )
}
