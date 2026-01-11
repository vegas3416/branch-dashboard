// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? '').trim();

  // Fake auth: accept anything non-empty
  if (!email) {
    return new NextResponse('Email is required', { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  // Very simple demo "session"
  res.cookies.set('session', 'demo-session', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
