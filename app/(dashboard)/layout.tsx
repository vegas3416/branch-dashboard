'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const navItems = [
  { href: '/overview', label: 'Overview' },
  { href: '/links', label: 'Links' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/settings', label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white">
          <div className="h-14 px-4 flex items-center border-b">
            <div className="font-semibold">Branch Dashboard</div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href === '/overview' && pathname === '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'block rounded-lg px-3 py-2 text-sm transition',
                    isActive
                      ? 'bg-red-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-3">
            <div className="rounded-xl border bg-white p-3 text-xs text-gray-600">
              <div className="font-medium text-gray-800">Workspace</div>
              <div className="mt-1">Demo • US Production</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-900">Mobile Growth</div>
              <span className="text-xs text-gray-500">/</span>
              <div className="text-sm text-gray-600">Dashboard</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <input
                  className="w-72 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Search links, campaigns…"
                />
              </div>

              <button className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">
                Last 30 days
              </button>

              <button className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">
                Jason
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
