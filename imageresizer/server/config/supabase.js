import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn('Supabase service credentials are not configured.');
}

export const supabaseAdmin = createClient(supabaseUrl || 'http://localhost', serviceKey || 'missing', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
