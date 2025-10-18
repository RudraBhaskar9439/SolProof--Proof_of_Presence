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
  checked_in_at: string;
  transaction_signature?: string;
  events?: Event;
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  total_badges: number;
  reputation_score: number;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  attendances?: Attendance[];
}