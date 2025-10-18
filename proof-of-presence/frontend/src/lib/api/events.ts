// frontend/src/lib/api/events.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

export const eventsApi = {
  async create(data: any) {
    const response = await axios.post(`${API_URL}/events/create`, data);
    return response.data;
  },

  async getByOrganizer(organizerWallet: string) {
    const response = await axios.get(`${API_URL}/events/organizer/${organizerWallet}`);
    const data = response.data as { events?: any[] };
    return data.events || [];
  },
};

export const qrApi = {
  async generate(eventId: string, organizerWallet: string) {
    const response = await axios.post(`${API_URL}/events/generate-qr`, {
      eventId,
      organizerWallet,
    });
    return response.data;
  },

  async verify(qrData: string, attendeeWallet: string) {
    const response = await axios.post(`${API_URL}/events/verify-qr`, {
      qrData,
      attendeeWallet,
    });
    return response.data;
  },

  async mintBadge(data: any) {
    const response = await axios.post(`${API_URL}/events/mint-badge`, data);
    return response.data;
  },
};

export const profileApi = {
  async get(wallet: string) {
    const response = await axios.get(`${API_URL}/profile/${wallet}`);
    return response.data;
  },

  async update(data: any) {
    const response = await axios.put(`${API_URL}/profile/update`, data);
    return response.data;
  },
};