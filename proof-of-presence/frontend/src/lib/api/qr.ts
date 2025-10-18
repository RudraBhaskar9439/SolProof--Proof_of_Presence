// frontend/src/lib/api/qr.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const qrApi = {
  /**
   * Generate QR code for an event
   * @param eventId - The event ID
   * @param organizerWallet - Organizer's wallet address
   * @returns QR data and URL
   */
  async generate(eventId: string, organizerWallet: string) {
    try {
      const response = await axios.post(`${API_URL}/events/generate-qr`, {
        eventId,
        organizerWallet,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error generating QR:', error);
      throw error;
    }
  },

  /**
   * Verify QR code validity
   * @param qrData - Base64 encoded QR data
   * @param attendeeWallet - Attendee's wallet address
   * @returns Verification result
   */
  async verify(qrData: string, attendeeWallet: string) {
    try {
      const response = await axios.post(`${API_URL}/events/verify-qr`, {
        qrData,
        attendeeWallet,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying QR:', error);
      throw error;
    }
  },

  /**
   * Record badge mint after successful verification
   * @param data - Mint badge data
   * @returns Success response
   */
  async mintBadge(data: {
    eventId: string;
    attendeeWallet: string;
    nftMint?: string;
    nftTokenAccount?: string;
    transactionSignature: string;
    metadataUri?: string;
  }) {
    try {
      const response = await axios.post(`${API_URL}/events/mint-badge`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error minting badge:', error);
      throw error;
    }
  },

  /**
   * Decode QR data from base64
   * @param qrData - Base64 encoded QR data
   * @returns Decoded QR payload
   */
  decodeQRData(qrData: string) {
    try {
      const decoded = atob(qrData);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding QR data:', error);
      return null;
    }
  },

  /**
   * Validate QR data format
   * @param qrData - QR data to validate
   * @returns true if valid
   */
  validateQRFormat(qrData: string): boolean {
    try {
      const decoded = this.decodeQRData(qrData);
      return !!(
        decoded &&
        decoded.eventId &&
        decoded.organizerPubkey &&
        decoded.timestamp &&
        decoded.nonce &&
        decoded.signature
      );
    } catch {
      return false;
    }
  },
};