// app/(dashboard)/layout.tsx
import Link from 'next/link';
import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { LogoutButton } from '@/components/LogoutButton';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/links', label: 'Links' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/settings', label: 'Settings' },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Next.js cookies() is async in newer App Router builds
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  // Middleware already blocks unauthenticated users, but keep it safe
  const email = session ? 'demo@branch.io' : null;

  let theme: 'light' | 'dark' = 'light';

  if (email) {
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
              <div className="font-semibold">Branch Dashboard</div>
            </div>

            <nav className="p-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100
                             dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

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

                <button
                  className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50
                                   dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  Last 30 days
                </button>

                <LogoutButton />
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
