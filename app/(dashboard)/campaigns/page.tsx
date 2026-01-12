// app/(dashboard)/campaigns/page.tsx
'use client';

import React, { useMemo, useState } from 'react';

type CampaignStatus = 'active' | 'paused' | 'draft';
type Channel = 'paid' | 'organic' | 'referral';

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: Channel;
  clicks: number;
  installs: number;
  ctr: number; // 0.0 - 1.0
  cpi: number; // dollars
  updatedAt: string; // ISO
  description?: string;
};

type DatePreset = '7d' | '30d';

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_001',
    name: 'App Launch – iOS',
    status: 'active',
    channel: 'paid',
    clicks: 8210,
    installs: 742,
    ctr: 0.09,
    cpi: 2.45,
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    description: 'Primary iOS launch campaign focused on paid acquisition.',
  },
  {
    id: 'cmp_002',
    name: 'Holiday Promo',
    status: 'paused',
    channel: 'paid',
    clicks: 4102,
    installs: 301,
    ctr: 0.073,
    cpi: 3.1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    description: 'Seasonal promo campaign (paused post-holiday).',
  },
  {
    id: 'cmp_003',
    name: 'Referral Boost Q1',
    status: 'active',
    channel: 'referral',
    clicks: 2890,
    installs: 402,
    ctr: 0.139,
    cpi: 1.8,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    description: 'Boost referrals via incentives and share links.',
  },
  {
    id: 'cmp_004',
    name: 'Organic Search – Brand',
    status: 'active',
    channel: 'organic',
    clicks: 6220,
    installs: 980,
    ctr: 0.112,
    cpi: 0.95,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    description: 'Brand keyword visibility and conversion tracking.',
  },
  {
    id: 'cmp_005',
    name: 'Retargeting – Warm Users',
    status: 'draft',
    channel: 'paid',
    clicks: 980,
    installs: 62,
    ctr: 0.051,
    cpi: 4.25,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
    description: 'Draft setup for retargeting warm audiences.',
  },
];

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatPct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

function formatMoney(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

function formatRelative(iso: string) {
  const dt = new Date(iso);
  const diffMs = Date.now() - dt.getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const map: Record<CampaignStatus, { label: string; classes: string }> = {
    active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    paused: { label: 'Paused', classes: 'bg-amber-50 text-amber-800 ring-amber-200' },
    draft: { label: 'Draft', classes: 'bg-slate-50 text-slate-700 ring-slate-200' },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        s.classes
      )}
    >
      {s.label}
    </span>
  );
}

function ChannelBadge({ channel }: { channel: Channel }) {
  const map: Record<Channel, { label: string; classes: string }> = {
    paid: { label: 'Paid', classes: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
    organic: { label: 'Organic', classes: 'bg-sky-50 text-sky-700 ring-sky-200' },
    referral: { label: 'Referral', classes: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200' },
  };
  const c = map[channel];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        c.classes
      )}
    >
      {c.label}
    </span>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 hover:text-slate-900',
        active ? 'text-slate-900' : 'text-slate-600'
      )}
    >
      <span>{label}</span>
      {active ? (
        <span className="text-[11px] leading-none">{dir === 'asc' ? '▲' : '▼'}</span>
      ) : (
        <span className="text-[11px] leading-none opacity-30">↕</span>
      )}
    </button>
  );
}

export default function CampaignsPage() {
  const [preset, setPreset] = useState<DatePreset>('7d');
  const [status, setStatus] = useState<'all' | CampaignStatus>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Campaign | null>(null);

  const [sortKey, setSortKey] = useState<
    'name' | 'status' | 'channel' | 'clicks' | 'installs' | 'ctr' | 'cpi' | 'updatedAt'
  >('clicks');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = MOCK_CAMPAIGNS.filter(c => {
      if (status !== 'all' && c.status !== status) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.channel.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    });

    const sorted = [...base].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;

      const get = (c: Campaign) => {
        switch (sortKey) {
          case 'name':
            return c.name.toLowerCase();
          case 'status':
            return c.status;
          case 'channel':
            return c.channel;
          case 'clicks':
            return c.clicks;
          case 'installs':
            return c.installs;
          case 'ctr':
            return c.ctr;
          case 'cpi':
            return c.cpi;
          case 'updatedAt':
            return new Date(c.updatedAt).getTime();
          default:
            return 0;
        }
      };

      const va = get(a) as any;
      const vb = get(b) as any;

      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * mul;
      return (va - vb) * mul;
    });

    return sorted;
  }, [query, status, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const activeCount = filtered.filter(c => c.status === 'active').length;
    const clicks = filtered.reduce((sum, c) => sum + c.clicks, 0);
    const installs = filtered.reduce((sum, c) => sum + c.installs, 0);

    // weighted ctr by clicks (avoid misleading average)
    const ctr = clicks > 0 ? filtered.reduce((sum, c) => sum + c.ctr * c.clicks, 0) / clicks : 0;

    // weighted cpi by installs
    const cpi =
      installs > 0 ? filtered.reduce((sum, c) => sum + c.cpi * c.installs, 0) / installs : 0;

    return { total, activeCount, clicks, installs, ctr, cpi };
  }, [filtered]);

  function toggleSort(nextKey: typeof sortKey) {
    if (sortKey === nextKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(nextKey);
      setSortDir('desc');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-600">
            Monitor and manage campaign performance for the selected period.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-white ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => setPreset('7d')}
              className={cn(
                'px-3 py-2 text-sm',
                preset === '7d' ? 'font-medium text-slate-900' : 'text-slate-600'
              )}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setPreset('30d')}
              className={cn(
                'px-3 py-2 text-sm',
                preset === '30d' ? 'font-medium text-slate-900' : 'text-slate-600'
              )}
            >
              Last 30 days
            </button>
          </div>

          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="h-10 rounded-lg bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="h-10 w-full min-w-[220px] rounded-lg bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none md:w-[280px]"
          />

          <button
            type="button"
            className="h-10 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => {
              // keep as mock; you can wire later
              alert('Demo: Create Campaign (not implemented)');
            }}
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">Campaigns</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {formatNumber(stats.total)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {formatNumber(stats.activeCount)} active
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">Clicks</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {formatNumber(stats.clicks)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Preset: {preset === '7d' ? '7d' : '30d'}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">Installs</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {formatNumber(stats.installs)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Weighted CTR: {formatPct(stats.ctr)}</div>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">Avg CPI</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{formatMoney(stats.cpi)}</div>
          <div className="mt-1 text-xs text-slate-500">Weighted by installs</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-900">Campaign List</div>
          <div className="text-xs text-slate-500">{formatNumber(filtered.length)} results</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3">
                  <SortHeader
                    label="Campaign"
                    active={sortKey === 'name'}
                    dir={sortDir}
                    onClick={() => toggleSort('name')}
                  />
                </th>
                <th className="px-4 py-3">
                  <SortHeader
                    label="Status"
                    active={sortKey === 'status'}
                    dir={sortDir}
                    onClick={() => toggleSort('status')}
                  />
                </th>
                <th className="px-4 py-3">
                  <SortHeader
                    label="Channel"
                    active={sortKey === 'channel'}
                    dir={sortDir}
                    onClick={() => toggleSort('channel')}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader
                    label="Clicks"
                    active={sortKey === 'clicks'}
                    dir={sortDir}
                    onClick={() => toggleSort('clicks')}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader
                    label="Installs"
                    active={sortKey === 'installs'}
                    dir={sortDir}
                    onClick={() => toggleSort('installs')}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader
                    label="CTR"
                    active={sortKey === 'ctr'}
                    dir={sortDir}
                    onClick={() => toggleSort('ctr')}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader
                    label="CPI"
                    active={sortKey === 'cpi'}
                    dir={sortDir}
                    onClick={() => toggleSort('cpi')}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader
                    label="Updated"
                    active={sortKey === 'updatedAt'}
                    dir={sortDir}
                    onClick={() => toggleSort('updatedAt')}
                  />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filtered.map(c => {
                const underperforming = c.ctr < 0.06 && c.status === 'active';
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelected(c)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-900">{c.name}</div>
                        {underperforming ? (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                            Low CTR
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">{c.description ?? '—'}</div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="px-4 py-3">
                      <ChannelBadge channel={c.channel} />
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(c.clicks)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatNumber(c.installs)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPct(c.ctr)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(c.cpi)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatRelative(c.updatedAt)}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-600" colSpan={8}>
                    No campaigns match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer (details) */}
      <div
        className={cn(
          'fixed inset-0 z-50 transition',
          selected ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!selected}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/30 transition-opacity',
            selected ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setSelected(null)}
        />

        {/* Panel */}
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform',
            selected ? 'translate-x-0' : 'translate-x-full'
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between border-b border-slate-200 p-4">
            <div>
              <div className="text-sm text-slate-600">Campaign</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {selected?.name ?? ''}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {selected ? <StatusBadge status={selected.status} /> : null}
                {selected ? <ChannelBadge channel={selected.channel} /> : null}
              </div>
            </div>

            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-xs font-medium text-slate-600">Summary</div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600">Clicks</div>
                  <div className="mt-1 text-base font-semibold text-slate-900 tabular-nums">
                    {selected ? formatNumber(selected.clicks) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Installs</div>
                  <div className="mt-1 text-base font-semibold text-slate-900 tabular-nums">
                    {selected ? formatNumber(selected.installs) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">CTR</div>
                  <div className="mt-1 text-base font-semibold text-slate-900 tabular-nums">
                    {selected ? formatPct(selected.ctr) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">CPI</div>
                  <div className="mt-1 text-base font-semibold text-slate-900 tabular-nums">
                    {selected ? formatMoney(selected.cpi) : '—'}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Updated {selected ? formatRelative(selected.updatedAt) : '—'}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-600">Description</div>
              <p className="mt-1 text-sm text-slate-700">{selected?.description ?? '—'}</p>
            </div>

            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="text-xs font-medium text-slate-600">Insights (demo)</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {selected?.status === 'active' && selected.ctr < 0.06 ? (
                  <li>• CTR is below 6% — consider creative refresh or audience narrowing.</li>
                ) : (
                  <li>• Performance looks stable for the current period.</li>
                )}
                {selected?.cpi && selected.cpi > 3 ? (
                  <li>• CPI is elevated — review bid strategy and placements.</li>
                ) : (
                  <li>• CPI is within a healthy range for this channel.</li>
                )}
                <li>• Click row items to drill into details (mock drawer).</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                onClick={() => alert('Demo: View analytics (not implemented)')}
              >
                View analytics
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                onClick={() => alert('Demo: Edit campaign (not implemented)')}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
