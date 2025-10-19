require('dotenv').config();
const { createClient }  = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if(!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey ) {
    console.error('Missing Supabase environment variables. PLease check .env file');
    process.exit(1);
}

// Client for client-side/public access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin client for service role key (for server side operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
    }
);

module.exports = {
    supabase,
    supabaseAdmin,
}