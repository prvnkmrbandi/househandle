import { createClient } from '@supabase/supabase-js';

// This uses the PUBLISHABLE / anon key only — safe to expose in the browser.
// Never put your service_role / secret key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
