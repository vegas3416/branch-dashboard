'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

//shadcn components
import { Button } from '@/components/ui/button';

type LinkRow = {
  id: string;
  name: string;
  shortUrl: string;
  destination: string;
  clicks: number;
  installs: number;
  status: 'Active' | 'Paused';
  createdAt: string;
};

//test seed data
const seedLinks: LinkRow[] = [
  {
    id: 'lnk_1',
    name: 'Winter Promo',
    shortUrl: 'brn.ch/winter',
    destination: 'https://example.com/winter',
    clicks: 8420,
    installs: 2310,
    status: 'Active',
    createdAt: '2026-01-03',
  },
  {
    id: 'lnk_2',
    name: 'Referral Invite',
    shortUrl: 'brn.ch/invite',
    destination: 'myapp://referral',
    clicks: 2210,
    installs: 690,
    status: 'Active',
    createdAt: '2026-01-05',
  },
  {
    id: 'lnk_3',
    name: 'QR Store Display',
    shortUrl: 'brn.ch/qr-store',
    destination: 'https://example.com/store',
    clicks: 520,
    installs: 210,
    status: 'Paused',
    createdAt: '2026-01-07',
  },
];

export default function LinksPage() {
  const [rows, setRows] = useState<LinkRow[]>(seedLinks);
  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.shortUrl.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.clicks += r.clicks;
        acc.installs += r.installs;
        return acc;
      },
      { clicks: 0, installs: 0 }
    );
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-gray-900">Links</div>
          <div className="text-sm text-gray-600">
            Create deep links and track performance across channels
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90"
        >
          Create link
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryCard title="Total clicks" value={totals.clicks.toLocaleString()} />
        <SummaryCard title="Total installs" value={totals.installs.toLocaleString()} />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <input
            className="w-full md:w-80 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Search by name, short link, destination…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Filters
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{filtered.length}</span> of{' '}
          <span className="font-medium text-gray-900">{rows.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr className="border-b">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Short link</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">Installs</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.id}</div>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/links/${r.id}`}
                      className="font-mono text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600"
                    >
                      {r.shortUrl}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="max-w-[420px] truncate text-gray-700">{r.destination}</div>
                  </td>

                  <td className="px-4 py-3 text-gray-700">{r.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{r.installs.toLocaleString()}</td>

                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="px-4 py-3 text-gray-700">{formatDate(r.createdAt)}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-gray-600" colSpan={7}>
                    No links match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {isCreateOpen && (
        <CreateLinkModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={newRow => {
            setRows(prev => [newRow, ...prev]);
            setIsCreateOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LinkRow['status'] }) {
  const base = 'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium';
  if (status === 'Active') {
    return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Active</span>;
  }
  return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>Paused</span>;
}

function CreateLinkModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (row: LinkRow) => void;
}) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [deepLink, setDeepLink] = useState('');

  const canCreate = name.trim().length > 0 && destination.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border bg-white p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Create link</div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <Field label="Name" value={name} onChange={setName} placeholder="e.g. Spring Campaign" />
          <Field
            label="Destination URL"
            value={destination}
            onChange={setDestination}
            placeholder="https://example.com/landing"
          />
          <Field
            label="Deep link (optional)"
            value={deepLink}
            onChange={setDeepLink}
            placeholder="myapp://product/123"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            className=" rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 cursor-pointer"
            variant="outline"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>

          <button
            disabled={!canCreate}
            onClick={() => {
              const id = `lnk_${Math.random().toString(16).slice(2, 10)}`;
              const slug = name.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 24) || 'link';
              onCreate({
                id,
                name: name.trim(),
                shortUrl: `brn.ch/${slug}`,
                destination: deepLink.trim() || destination.trim(),
                clicks: 0,
                installs: 0,
                status: 'Active',
                createdAt: new Date().toISOString().slice(0, 10),
              });
            }}
            className={[
              'rounded-lg px-3 py-2 text-sm font-medium',
              canCreate
                ? 'bg-black text-white hover:bg-black/90 cursor-pointer'
                : 'bg-gray-100 text-gray-600 cursor-not-allowed',
            ].join(' ')}
          >
            Create
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Note: this demo stores links in local component state only (no backend yet).
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-black">{label}</div>
      <input
        className="w-full rounded-lg border border-black bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-gray-200"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function formatDate(isoDate: string) {
  // isoDate: YYYY-MM-DD
  const [y, m, d] = isoDate.split('-').map(v => Number(v));
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
