// app/api/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// export async function GET() {
//   const session = (await cookies()).get('session')?.value;
//   if (!session) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const email = 'demo@branch.io';

//   const user = await prisma.user.findUnique({
//     where: { email },
//     include: { settings: true },
//   });

//   if (!user) {
//     return NextResponse.json({ error: 'User not found' }, { status: 404 });
//   }

//   return NextResponse.json({
//     user: { id: user.id, email: user.email, name: user.name },
//     settings: user.settings ?? { theme: 'light' },
//     generatedAt: new Date().toISOString(),
//   });
// }

export async function GET() {
  // Demo-friendly: avoid DB dependency during deploy
  return NextResponse.json({
    id: 'demo',
    name: 'Demo User',
    email: 'demo@branch.local',
  });
}
