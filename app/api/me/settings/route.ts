import { NextResponse } from 'next/server';

type Theme = 'light' | 'dark';

export async function PATCH(req: Request) {
  const demoMode = process.env.DEMO_MODE === 'true';
  const body = (await req.json().catch(() => null)) as { theme?: Theme } | null;

  const nextTheme = body?.theme;
  if (nextTheme !== 'light' && nextTheme !== 'dark') {
    return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
  }

  if (demoMode) {
    // No DB in demo mode: pretend we saved it
    return NextResponse.json({
      ok: true,
      settings: { theme: nextTheme },
    });
  }

  // Non-demo: update in Prisma
  // Example skeleton:
  // await prisma.userSettings.update({ ... })
  // return NextResponse.json({ ok: true, settings: { theme: nextTheme } });

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
