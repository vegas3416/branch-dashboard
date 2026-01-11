'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Link from 'next/link';


type StatPoint = { day: string; clicks: number; installs: number };

const sampleSeries: StatPoint[] = [
  { day: 'Jan 1', clicks: 140, installs: 32 },
  { day: 'Jan 2', clicks: 180, installs: 40 },
  { day: 'Jan 3', clicks: 120, installs: 28 },
  { day: 'Jan 4', clicks: 220, installs: 55 },
  { day: 'Jan 5', clicks: 260, installs: 62 },
  { day: 'Jan 6', clicks: 240, installs: 58 },
  { day: 'Jan 7', clicks: 300, installs: 74 },
];

export default function LinkDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? 'unknown';

  const meta = useMemo(() => {
    // Demo metadata (in a real app, fetch by id)
    return {
      id,
      name: 'Link Detail',
      shortUrl: `brn.ch/${String(id).slice(0, 8)}`,
      destination: 'https://example.com/landing',
      status: 'Active' as const,
      createdAt: '2026-01-03',
    };
  }, [id]);

  const totals = useMemo(() => {
    return sampleSeries.reduce(
      (acc, p) => {
        acc.clicks += p.clicks;
        acc.installs += p.installs;
        return acc;
      },
      { clicks: 0, installs: 0 }
    );
  }, []);

  return (
    <div className="space-y-6">
      <Link
        href="/links"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to Links
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900">{meta.name}</div>
          <div className="mt-1 text-sm text-gray-600">
            <span className="font-mono text-gray-900">{meta.shortUrl}</span>
            <span className="mx-2 text-gray-400">→</span>
            <span className="text-gray-700">{meta.destination}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            ID: <span className="font-mono">{meta.id}</span> • Created {formatDate(meta.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={meta.status} />
          <button className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700">
            Edit
          </button>
          <button className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white">
            Copy link
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi title="Clicks (7d)" value={totals.clicks.toLocaleString()} />
        <Kpi title="Installs (7d)" value={totals.installs.toLocaleString()} />
        <Kpi
          title="CVR (7d)"
          value={
            totals.clicks === 0
              ? '—'
              : `${Math.round((totals.installs / totals.clicks) * 1000) / 10}%`
          }
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium text-gray-900">Performance</div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="installs" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-900">Attribution</div>
          <div className="mt-2 text-sm text-gray-600">
            Placeholder: channel split, referrers, and campaign association.
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-900">Destinations</div>
          <div className="mt-2 text-sm text-gray-600">
            Placeholder: web vs deep link routing rules.
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'Active' | 'Paused' }) {
  const base = 'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium';
  if (status === 'Active') {
    return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Active</span>;
  }
  return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>Paused</span>;
}

function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(v => Number(v));
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
