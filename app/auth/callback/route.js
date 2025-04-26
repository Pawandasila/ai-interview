import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error.message);
        // If there's an error, redirect to login page
        return NextResponse.redirect(new URL('/auth', requestUrl.origin));
      }
    }

    // URL to redirect to after sign in process completes - redirecting to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    // In case of any unexpected errors, redirect to login
    return NextResponse.redirect(new URL('/auth', request.nextUrl.origin));
  }
}