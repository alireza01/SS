import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Check if registration is allowed
    const { data: settings } = await supabase
      .from('site_settings')
      .select('allow_registration')
      .single();

    if (!settings?.allow_registration) {
      return NextResponse.json(
        { message: 'Registration is currently disabled' },
        { status: 403 }
      );
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Check your email to confirm your account' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 