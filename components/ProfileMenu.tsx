'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';
import Image from 'next/image';

type Item = { label: string; href?: string; onClick?: () => void };

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function doSignOut() {
    try {
      setSigningOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  }

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const items: Item[] = [
    { label: 'Profile', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Billing', href: '/' },
    {
      label: 'Sign out',
      onClick: () => {
        setConfirmOpen(true);
      },
    },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1.5 cursor-pointer "
      >
        {/* Replace with your icon/avatar */}
        <div className="h-12 w-12 overflow-hidden rounded-full">
          <Image
            src="/branch/avatar.svg"
            alt="Profile"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>

        <span className="hidden text-sm text-muted-foreground md:block">Jason</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">Jason</p>
            <p className="text-xs text-muted-foreground">jason@example.com</p>
          </div>
          <div className="h-px bg-border" />
          <ul className="py-1">
            {items.map(item => {
              const base =
                'block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted';
              if (item.href) {
                return (
                  <li key={item.label}>
                    <Link
                      role="menuitem"
                      className={base}
                      href={item.href}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <button
                    role="menuitem"
                    type="button"
                    className={base}
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Sign out?"
        description="You’ll be logged out of Branch Dashboard."
        confirmText="Sign out"
        cancelText="Cancel"
        loading={signingOut}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await doSignOut();
        }}
      />
    </div>
  );
}
