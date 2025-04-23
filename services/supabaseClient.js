import { createClient } from "@supabase/supabase-js";

const supabaseUrl =process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnoKey = process.env.NEXT_PUBLIC_SUPABASE_ANOTATION_URL

export const supabase = createClient(
    supabaseUrl , supabaseAnoKey
)