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

import { useEffect, useState } from "react";
import axios from "axios";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || import.meta.env.VITE_API_URL}/api/events`)
      .then(res => {
        setEvents(res.data.events || []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Events</h1>
      <button style={{ float: "right" }}>Create Event</button>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events yet</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id || event.event_id}>
              <strong>{event.name}</strong> ({event.date})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}