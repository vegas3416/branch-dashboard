// app/api/me/settings/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type Theme = 'light' | 'dark';

export async function PATCH(req: Request) {
  const session = (await cookies()).get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<{ theme: Theme }>;
  const theme = body.theme;

  if (theme !== 'light' && theme !== 'dark') {
    return NextResponse.json({ error: "Invalid theme. Use 'light' or 'dark'." }, { status: 400 });
  }

  const email = 'demo@branch.io';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { theme },
    create: { userId: user.id, theme },
  });

  return NextResponse.json({ settings });
}
