import { NextResponse } from 'next/server';

type Theme = 'light' | 'dark';

export async function GET() {
  const demoMode = process.env.DEMO_MODE === 'true';

  if (demoMode) {
    return NextResponse.json({
      user: {
        id: 'demo',
        email: 'demo@branch.io',
        name: 'Demo User',
      },
      settings: {
        theme: 'light' as Theme,
      },
    });
  }

  // TODO: Non-demo implementation (Prisma/session)
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
