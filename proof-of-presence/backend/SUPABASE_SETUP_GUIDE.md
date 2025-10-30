# 🗄️ Supabase Backend Setup Guide

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: `nxhcokhqbxtgnxhsdxfe`

## Step 2: Run SQL Schema

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-setup.sql`
4. Paste into the SQL editor
5. Click **Run** or press `Ctrl/Cmd + Enter`

This will create:
- ✅ 5 Tables (events, user_profiles, attendances, qr_tokens, notifications)
- ✅ Indexes for performance
- ✅ Views for common queries
- ✅ Triggers for auto-updates
- ✅ Row Level Security policies
- ✅ Sample data for testing

## Step 3: Verify Tables Created

Go to **Table Editor** (left sidebar) and verify you see:
- `events`
- `user_profiles`
- `attendances`
- `qr_tokens`
- `notifications`

## Step 4: Test the Setup

Run these test queries in SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- View sample events
SELECT * FROM events;

-- View leaderboard
SELECT * FROM leaderboard_view LIMIT 10;
```

## Database Schema Overview

### 📊 Tables

#### 1. **events**
Stores all event information
- `id` - UUID primary key
- `event_id` - Unique event identifier
- `event_name` - Event name
- `description` - Event description
- `event_date` - When the event happens
- `location` - Event location
- `max_attendees` - Maximum capacity
- `current_attendees` - Current check-ins
- `organizer_wallet` - Creator's wallet address
- `is_active` - Event status

#### 2. **user_profiles**
User reputation and profile data
- `id` - UUID primary key
- `wallet_address` - Solana wallet (unique)
- `username` - Display name
- `avatar_url` - Profile picture
- `bio` - User bio
- `total_badges` - Number of events attended
- `reputation_score` - Total XP earned

#### 3. **attendances**
Records of event check-ins
- `id` - UUID primary key
- `event_id` - Foreign key to events
- `attendee_wallet` - Who attended
- `nft_mint` - NFT badge address
- `transaction_signature` - Blockchain proof
- `checked_in_at` - Timestamp

#### 4. **qr_tokens**
Secure QR codes for check-in
- `id` - UUID primary key
- `event_id` - Foreign key to events
- `nonce` - Unique random string
- `signature` - Cryptographic signature
- `expires_at` - Expiration time
- `is_used` - Whether QR was scanned

#### 5. **notifications**
User notifications
- `id` - UUID primary key
- `user_wallet` - Recipient
- `title` - Notification title
- `message` - Notification body
- `type` - Category (badge_minted, etc.)
- `is_read` - Read status

## API Endpoints Already Configured

Your Express backend (`backend/src/`) already has these endpoints:

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `POST /api/events/mint-badge` - Record badge minting

### QR Codes
- `POST /api/events/generate-qr` - Generate QR code
- `POST /api/events/verify-qr` - Verify QR code

### Profile
- `GET /api/profile/:wallet` - Get user profile
- `GET /api/profile/:wallet/badges` - Get user's badges

### Leaderboard
- `GET /api/leaderboard` - Get top users

## Environment Variables

Already configured in `backend/.env`:
```
SUPABASE_URL=https://nxhcokhqbxtgnxhsdxfe.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing the Backend

1. Start backend server:
```bash
cd backend
npm run dev
```

2. Test endpoints:
```bash
# Get all events
curl http://localhost:4000/api/events

# Get leaderboard
curl http://localhost:4000/api/leaderboard

# Get user profile
curl http://localhost:4000/api/profile/YOUR_WALLET_ADDRESS
```

## Troubleshooting

### Issue: Tables not created
- Make sure you're in the correct project
- Check SQL Editor for error messages
- Verify you have admin permissions

### Issue: RLS blocking queries
- Queries from backend use SERVICE_KEY (bypasses RLS)
- Frontend queries use ANON_KEY (respects RLS)

### Issue: Foreign key errors
- Make sure parent records exist before creating child records
- Events must exist before creating attendances

## Maintenance

### Clean expired QR tokens (run weekly)
```sql
DELETE FROM qr_tokens 
WHERE expires_at < NOW() AND is_used = false;
```

### Update attendance counts
```sql
UPDATE events e
SET current_attendees = (
    SELECT COUNT(*) FROM attendances a WHERE a.event_id = e.id
);
```

## Next Steps

1. ✅ Run the SQL schema in Supabase
2. ✅ Verify tables are created
3. ✅ Start the backend server
4. ✅ Test API endpoints
5. ✅ Start the frontend
6. ✅ Create your first event!

---

**Your Supabase backend is now ready! 🚀**
