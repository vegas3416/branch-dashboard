// app/(dashboard)/layout.tsx
export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SidebarNav } from '@/components/SidebarNav';
import Image from 'next/image';
import Link from 'next/link';
import ProfileMenu from '@/components/ProfileMenu';

// Demo-mode user + settings (no DB)
const DEMO_USER = {
  id: 'demo',
  email: 'demo@branch.io',
  name: 'Demo User',
  settings: {
    theme: 'light' as const, // change to "dark" if you want default dark
  },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const demoMode = process.env.DEMO_MODE === 'true';

  // Only import Prisma when NOT in demo mode
  const prisma = demoMode ? null : (await import('@/lib/prisma')).prisma;

  // Next.js cookies() is async in newer App Router builds
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  // In demo mode, always use the demo user. Otherwise rely on session.
  const email = demoMode ? DEMO_USER.email : session ? 'demo@branch.io' : null;

  let theme: 'light' | 'dark' = 'light';

  if (demoMode) {
    theme = DEMO_USER.settings.theme;
  } else if (email && prisma) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true },
    });

    const t = user?.settings?.theme;
    if (t === 'dark' || t === 'light') theme = t;
  }

  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-900 bg-background dark:text-foreground">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-sidebar">
            <div className="h-14 px-4 flex items-center border-b dark:border-gray-800">
              <Link href="/overview" className="flex items-center gap-2">
                <Image
                  src="/branch/branch.svg"
                  alt="Branch"
                  width={120}
                  height={28}
                  className="invert-0 dark:invert opacity-90 hover:opacity-100 transition"
                />
                {/* Optional text label */}
              </Link>
            </div>

            <SidebarNav />

            <div className="mt-auto p-3">
              <div
                className="rounded-xl border bg-white p-3 text-xs text-gray-600
                              dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
              >
                <div className="font-medium text-gray-800 dark:text-gray-100">Workspace</div>
                <div className="mt-1">Demo • US Production</div>
                <div className="mt-1">Theme: {theme}</div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Topbar */}
            <header
              className="h-14 border-b bg-white px-4 flex items-center justify-between
                               dark:bg-gray-900 dark:border-gray-800"
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Mobile Growth</div>
                <span className="text-xs text-gray-500 dark:text-gray-400">/</span>
                <div className="text-sm text-gray-600 dark:text-gray-300">Dashboard</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:block">
                  <input
                    className="w-72 rounded-lg border px-3 py-2 text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-black/10
                               dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100
                               dark:focus:ring-white/10"
                    placeholder="Search links, campaigns…"
                  />
                </div>

                <ProfileMenu />
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
