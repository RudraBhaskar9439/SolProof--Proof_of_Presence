-- =====================================================
-- SOLPROOF - SUPABASE DATABASE SCHEMA
-- Complete backend setup for Proof of Presence
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: EVENTS
-- Stores all event information
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(300),
    max_attendees INTEGER DEFAULT 100,
    current_attendees INTEGER DEFAULT 0,
    metadata_uri VARCHAR(500),
    nft_image_url VARCHAR(500),
    organizer_wallet VARCHAR(100) NOT NULL,
    event_pda VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_events_organizer ON events(organizer_wallet);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_date ON events(event_date);

-- =====================================================
-- TABLE 2: USER_PROFILES
-- Stores user reputation and badge information
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    total_badges INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_profiles_reputation ON user_profiles(reputation_score DESC);

-- =====================================================
-- TABLE 3: ATTENDANCES
-- Records of who attended which events
-- =====================================================
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_wallet VARCHAR(100) NOT NULL,
    nft_mint VARCHAR(100),
    nft_token_account VARCHAR(100),
    metadata_uri VARCHAR(500),
    transaction_signature VARCHAR(200),
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, attendee_wallet)
);

-- Indexes for faster queries
CREATE INDEX idx_attendances_event ON attendances(event_id);
CREATE INDEX idx_attendances_wallet ON attendances(attendee_wallet);
CREATE INDEX idx_attendances_date ON attendances(checked_in_at);

-- =====================================================
-- TABLE 4: QR_TOKENS
-- Secure QR code tokens for check-in
-- =====================================================
CREATE TABLE IF NOT EXISTS qr_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    nonce VARCHAR(100) UNIQUE NOT NULL,
    signature VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by VARCHAR(100),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_qr_tokens_event ON qr_tokens(event_id);
CREATE INDEX idx_qr_tokens_nonce ON qr_tokens(nonce);
CREATE INDEX idx_qr_tokens_expires ON qr_tokens(expires_at);

-- =====================================================
-- TABLE 5: NOTIFICATIONS
-- User notifications for events and achievements
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'badge_minted', 'event_created', 'reputation_earned'
    is_read BOOLEAN DEFAULT false,
    related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_notifications_wallet ON notifications(user_wallet);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for events table
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles table
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Leaderboard with user rankings
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY reputation_score DESC, total_badges DESC) as rank,
    wallet_address,
    username,
    avatar_url,
    total_badges,
    reputation_score,
    created_at
FROM user_profiles
ORDER BY reputation_score DESC, total_badges DESC;

-- View: Event details with attendance info
CREATE OR REPLACE VIEW events_with_attendance AS
SELECT 
    e.*,
    COUNT(a.id) as actual_attendees,
    ARRAY_AGG(a.attendee_wallet) FILTER (WHERE a.attendee_wallet IS NOT NULL) as attendee_list
FROM events e
LEFT JOIN attendances a ON e.id = a.event_id
GROUP BY e.id;

-- View: User profile with attended events
CREATE OR REPLACE VIEW user_profiles_with_events AS
SELECT 
    up.*,
    COALESCE(json_agg(
        json_build_object(
            'event_id', e.event_id,
            'event_name', e.event_name,
            'event_date', e.event_date,
            'location', e.location,
            'checked_in_at', a.checked_in_at,
            'nft_mint', a.nft_mint
        )
    ) FILTER (WHERE e.id IS NOT NULL), '[]') as attended_events
FROM user_profiles up
LEFT JOIN attendances a ON up.wallet_address = a.attendee_wallet
LEFT JOIN events e ON a.event_id = e.id
GROUP BY up.id;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Events: Anyone can read, only service role can write
CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "Events can be created by service role"
    ON events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Events can be updated by service role"
    ON events FOR UPDATE
    USING (true);

-- User Profiles: Anyone can read, only service role can write
CREATE POLICY "Profiles are viewable by everyone"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Profiles can be created by service role"
    ON user_profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Profiles can be updated by service role"
    ON user_profiles FOR UPDATE
    USING (true);

-- Attendances: Anyone can read, only service role can write
CREATE POLICY "Attendances are viewable by everyone"
    ON attendances FOR SELECT
    USING (true);

CREATE POLICY "Attendances can be created by service role"
    ON attendances FOR INSERT
    WITH CHECK (true);

-- QR Tokens: Only service role can access
CREATE POLICY "QR tokens are managed by service role"
    ON qr_tokens FOR ALL
    USING (true);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (true);

CREATE POLICY "Notifications can be created by service role"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (true);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample event
INSERT INTO events (event_id, event_name, description, event_date, location, max_attendees, organizer_wallet, is_active)
VALUES 
    ('sample_event_001', 'Solana Breakpoint India 2025', 'Annual Solana developer conference in India', NOW() + INTERVAL '30 days', 'Bangalore, India', 500, 'SAMPLE_WALLET_ADDRESS_123', true),
    ('sample_event_002', 'Web3 Developer Meetup', 'Monthly meetup for Web3 developers', NOW() + INTERVAL '7 days', 'Mumbai, India', 100, 'SAMPLE_WALLET_ADDRESS_456', true)
ON CONFLICT (event_id) DO NOTHING;

-- =====================================================
-- HELPFUL QUERIES FOR BACKEND
-- =====================================================

-- Get leaderboard (top 100 users)
-- SELECT * FROM leaderboard_view LIMIT 100;

-- Get user profile with all attended events
-- SELECT * FROM user_profiles_with_events WHERE wallet_address = 'USER_WALLET';

-- Get event with current attendance count
-- SELECT * FROM events_with_attendance WHERE event_id = 'EVENT_ID';

-- Get all active events
-- SELECT * FROM events WHERE is_active = true ORDER BY event_date ASC;

-- Get user's badges/attendances
-- SELECT e.event_name, e.event_date, a.checked_in_at, a.nft_mint
-- FROM attendances a
-- JOIN events e ON a.event_id = e.id
-- WHERE a.attendee_wallet = 'USER_WALLET'
-- ORDER BY a.checked_in_at DESC;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Clean up expired QR tokens (run periodically)
-- DELETE FROM qr_tokens WHERE expires_at < NOW() AND is_used = false;

-- Update event attendance counts (if needed)
-- UPDATE events e
-- SET current_attendees = (
--     SELECT COUNT(*) FROM attendances a WHERE a.event_id = e.id
-- );

-- =====================================================
-- END OF SCHEMA
-- =====================================================

COMMENT ON TABLE events IS 'Stores all event information including metadata and attendance limits';
COMMENT ON TABLE user_profiles IS 'User profiles with reputation scores and badge counts';
COMMENT ON TABLE attendances IS 'Records of event attendance with NFT mint information';
COMMENT ON TABLE qr_tokens IS 'Secure QR code tokens for event check-in';
COMMENT ON TABLE notifications IS 'User notifications for various events and achievements';
