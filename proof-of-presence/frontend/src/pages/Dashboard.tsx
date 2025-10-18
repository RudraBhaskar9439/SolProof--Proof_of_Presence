// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { eventsApi, qrApi } from '../lib/api/events';
import type { Event } from '../types';

export default function Dashboard() {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [qrData, setQrData] = useState('');
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: '',
    eventDate: '',
    location: '',
    maxAttendees: 100,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!publicKey) {
      navigate('/');
      return;
    }
    fetchEvents();
  }, [publicKey, navigate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsApi.getByOrganizer(publicKey?.toBase58() || '');
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError('');
    const eventId = `event_${Date.now()}`;
    try {
      const res = await eventsApi.create({
        eventId,
        eventName: newEvent.eventName,
        description: newEvent.description,
        eventDate: newEvent.eventDate,
        location: newEvent.location,
        maxAttendees: newEvent.maxAttendees,
        organizerWallet: publicKey.toBase58(),
      });
      if (res.success) {
        setShowCreateModal(false);
        fetchEvents();
      } else {
        setError(res.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (event: Event) => {
    if (!publicKey) return;
    setLoading(true);
    setError('');
    try {
      const res = await qrApi.generate(event.event_id, publicKey.toBase58());
      if (res.success) {
        setQrData(res.qrData);
        setSelectedEvent(event);
        setShowQRModal(true);
      } else {
        setError(res.error || 'Failed to generate QR');
      }
    } catch (err) {
      setError('Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Events</h1>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg"
            onClick={() => setShowCreateModal(true)}
          >
            Create Event
          </button>
        </div>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard key={event.id} event={event} onGenerateQR={() => generateQR(event)} />
            ))}
          </div>
        )}
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-black">
            <h2 className="text-2xl font-bold mb-4">Create Event</h2>
            <input
              type="text"
              placeholder="Event Name"
              className="w-full mb-3 p-2 rounded border"
              value={newEvent.eventName}
              onChange={e => setNewEvent({ ...newEvent, eventName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              className="w-full mb-3 p-2 rounded border"
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <input
              type="datetime-local"
              placeholder="Event Date"
              className="w-full mb-3 p-2 rounded border"
              value={newEvent.eventDate}
              onChange={e => setNewEvent({ ...newEvent, eventDate: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              className="w-full mb-3 p-2 rounded border"
              value={newEvent.location}
              onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max Attendees"
              className="w-full mb-3 p-2 rounded border"
              value={newEvent.maxAttendees}
              onChange={e => setNewEvent({ ...newEvent, maxAttendees: Number(e.target.value) })}
            />
            <div className="flex gap-3 mt-4">
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded"
                onClick={createEvent}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showQRModal && selectedEvent && (
        <QRCodeDisplay
          qrData={qrData}
          eventName={selectedEvent.event_name}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}

function EventCard({ event, onGenerateQR }: { event: Event; onGenerateQR: () => void }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold mb-2">{event.event_name}</h3>
        <p className="text-gray-300 mb-2">{event.description}</p>
        <p className="text-gray-400 mb-2">Date: {new Date(event.event_date).toLocaleString()}</p>
        <p className="text-gray-400 mb-2">Location: {event.location}</p>
        <p className="text-gray-400 mb-2">Attendees: {event.current_attendees} / {event.max_attendees}</p>
      </div>
      <button
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl mt-4"
        onClick={onGenerateQR}
      >
        Generate QR
      </button>
    </div>
  );
}