'use client';

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm('Log out?')) return;
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
      }}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted"
    >
      Jason
    </button>
  );
}
