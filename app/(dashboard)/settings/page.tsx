// app/(dashboard)/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Theme = 'light' | 'dark';

type MeResponse = {
  user: { id: string; email: string; name: string | null };
  settings: { theme: Theme };
};

export default function SettingsPage() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function loadMe() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/me', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as MeResponse;
      setData(json);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  async function updateTheme(nextTheme: Theme) {
    if (!data) return;

    // optimistic UI
    setData({ ...data, settings: { theme: nextTheme } });
    setIsSavingTheme(true);

    try {
      await sleep(2000); // simulate network delay
      const res = await fetch('/api/me/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme }),
      });

      if (!res.ok) throw new Error(await res.text());

      // optional: re-sync from server to be safe
      await loadMe();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save theme');
      // revert on error
      await loadMe();
    } finally {
      setIsSavingTheme(false);
    }
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold">Settings</div>
        <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold">Settings</div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
        <button
          onClick={loadMe}
          className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const theme = data.settings.theme;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-gray-600">Profile and preferences</div>
      </div>

      {/* Profile card */}
      <section className="rounded-2xl border bg-white p-5">
        <div className="text-sm font-semibold text-gray-900">Profile</div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs text-gray-500">Name</div>
            <div className="mt-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {data.user.name ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="mt-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {data.user.email}
            </div>
          </div>
        </div>
      </section>

      {/* Appearance card */}
      <section className="rounded-2xl border bg-white p-5">
        <div className="text-sm font-semibold text-gray-900">Appearance</div>
        <div className="mt-1 text-sm text-gray-600">
          Toggle light/dark theme (saved to the database)
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border bg-white p-4">
          <div>
            <div className="text-sm font-medium text-gray-900">Theme</div>
            <div className="text-xs text-gray-500">
              Current: <span className="font-medium">{theme}</span>
              {isSavingTheme ? ' • saving…' : ''}
            </div>
          </div>

          <div className="flex items-center gap-2 ">
            <button
              type="button"
              disabled={isSavingTheme || theme === 'light'}
              onClick={() => updateTheme('light')}
              className="rounded-lg border bg-button px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50 hover:text-gray-600 disabled:bg-[var(--button-disabled)]"
            >
              Light
            </button>
            <button
              type="button"
              disabled={isSavingTheme || theme === 'dark'}
              onClick={() => updateTheme('dark')}
              className="rounded-lg border bg-button px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50 disabled:bg-[var(--button-disabled)] disabled:text-gray-600"
            >
              Dark
            </button>
          </div>
        </div>
      </section>

      {/* Debug */}
      <section className="rounded-2xl border bg-white p-5">
        <div className="text-sm font-semibold text-gray-900">Debug</div>
        <pre className="mt-3 overflow-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      </section>
    </div>
  );
}
