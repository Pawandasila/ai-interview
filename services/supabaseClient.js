import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isProduction = process.env.NODE_ENV === "production";

export const supabase = createClient(
    supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            cookieOptions: {
                secure: isProduction,
                sameSite: 'lax',
                path: '/dashboard',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            }
        }
    }
);
