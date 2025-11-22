
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_serenity_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plqjkefwmydbhetdmfew.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_serenity_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build';

if (!process.env.NEXT_PUBLIC_serenity_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Missing NEXT_PUBLIC_serenity_SUPABASE_ANON_KEY. Supabase features will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
