'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Link as LinkIcon, Megaphone, BarChart3, Settings } from 'lucide-react';

export type NavItem = { href: string; label: string; icon: SVGSVGElement | null };

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/links', label: 'Links', icon: LinkIcon },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="p-3 space-y-1">
      {navItems.map(item => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'block rounded-lg px-3 py-2 text-sm transition',
              'hover:bg-muted',
              active
                ? 'bg-background text-foreground font-medium ring-1 ring-border'
                : 'text-muted-foreground',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />}
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
