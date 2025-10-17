// app/src/types/index.ts

export interface Event {
  id: string;
  event_id: string;
  organizer_wallet: string;
  event_name: string;
  description?: string;
  event_date: string;
  location?: string;
  max_attendees: number;
  current_attendees: number;
  metadata_uri?: string;
  nft_image_url?: string;
  is_active: boolean;
  event_pda?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  attendee_wallet: string;
  nft_mint?: string;
  nft_token_account?: string;
  metadata_uri?: string;
  checked_in_at: string;
  transaction_signature?: string;
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  profile_pda?: string;
  total_badges: number;
  reputation_score: number;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface QRToken {
  id: string;
  event_id: string;
  nonce: string;
  signature: string;
  expires_at: string;
  is_used: boolean;
  used_by?: string;
  used_at?: string;
  created_at: string;
}

export interface QRPayload {
  eventId: string;
  organizerPubkey: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

export interface CreateEventRequest {
  eventId: string;
  eventName: string;
  description?: string;
  eventDate: string;
  location?: string;
  maxAttendees?: number;
  metadataUri?: string;
  nftImageUrl?: string;
  organizerWallet: string;
  eventPda?: string;
}

export interface MintBadgeRequest {
  eventId: string;
  attendeeWallet: string;
  nftMint?: string;
  nftTokenAccount?: string;
  transactionSignature: string;
  metadataUri?: string;
}