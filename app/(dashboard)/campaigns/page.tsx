// app/(dashboard)/campaigns/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

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

function ColumnsMenu({
  visibility,
  setVisibility,
  columns,
}: {
  visibility: VisibilityState;
  setVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  columns: Array<{ id: string; label: string; lock?: boolean }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="h-10 rounded-lg bg-white px-3 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
      >
        Columns
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
          <div className="px-2 py-1 text-xs font-medium text-slate-600">Toggle columns</div>
          <div className="mt-1 space-y-1">
            {columns.map(c => {
              const checked = visibility[c.id] ?? true;
              return (
                <label
                  key={c.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50',
                    c.lock && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <span className="text-slate-800">{c.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={c.lock}
                    onChange={e => {
                      const next = e.target.checked;
                      setVisibility(prev => ({ ...prev, [c.id]: next }));
                    }}
                  />
                </label>
              );
            })}
          </div>

          <div className="mt-2 flex gap-2 px-2 pb-1">
            <button
              type="button"
              className="flex-1 rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              onClick={() => {
                const allOn: VisibilityState = {};
                columns.forEach(c => (allOn[c.id] = true));
                setVisibility(allOn);
              }}
            >
              Show all
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CampaignsPage() {
  const [preset, setPreset] = useState<DatePreset>('7d');
  const [status, setStatus] = useState<'all' | CampaignStatus>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Campaign | null>(null);

  // TanStack state
  const [sorting, setSorting] = useState<SortingState>([{ id: 'clicks', desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // you can set defaults here, e.g. hide description:
    // description: false,
  });

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_CAMPAIGNS.filter(c => {
      if (status !== 'all' && c.status !== status) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.channel.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    });
  }, [query, status]);

  const stats = useMemo(() => {
    const total = data.length;
    const activeCount = data.filter(c => c.status === 'active').length;
    const clicks = data.reduce((sum, c) => sum + c.clicks, 0);
    const installs = data.reduce((sum, c) => sum + c.installs, 0);

    const ctr = clicks > 0 ? data.reduce((sum, c) => sum + c.ctr * c.clicks, 0) / clicks : 0;
    const cpi = installs > 0 ? data.reduce((sum, c) => sum + c.cpi * c.installs, 0) / installs : 0;

    return { total, activeCount, clicks, installs, ctr, cpi };
  }, [data]);

  const columns = useMemo<ColumnDef<Campaign>[]>(() => {
    return [
      {
        id: 'name',
        header: 'Campaign',
        accessorKey: 'name',
        cell: ({ row }) => {
          const c = row.original;
          const underperforming = c.ctr < 0.06 && c.status === 'active';
          return (
            <div>
              <div className="flex items-center gap-2">
                <div className="font-medium text-slate-900">{c.name}</div>
                {underperforming ? (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                    Low CTR
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">{c.description ?? '—'}</div>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as CampaignStatus} />,
      },
      {
        id: 'channel',
        header: 'Channel',
        accessorKey: 'channel',
        cell: ({ getValue }) => <ChannelBadge channel={getValue() as Channel} />,
      },
      {
        id: 'clicks',
        header: 'Clicks',
        accessorKey: 'clicks',
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatNumber(getValue() as number)}</span>
        ),
        meta: { align: 'right' as const },
      },
      {
        id: 'installs',
        header: 'Installs',
        accessorKey: 'installs',
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatNumber(getValue() as number)}</span>
        ),
        meta: { align: 'right' as const },
      },
      {
        id: 'ctr',
        header: 'CTR',
        accessorKey: 'ctr',
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatPct(getValue() as number)}</span>
        ),
        meta: { align: 'right' as const },
      },
      {
        id: 'cpi',
        header: 'CPI',
        accessorKey: 'cpi',
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatMoney(getValue() as number)}</span>
        ),
        meta: { align: 'right' as const },
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        accessorKey: 'updatedAt',
        cell: ({ getValue }) => (
          <span className="text-slate-600">{formatRelative(getValue() as string)}</span>
        ),
        meta: { align: 'right' as const },
      },
    ];
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // If you later add pagination/filtering models, you extend here.
  });

  const columnToggleList = [
    { id: 'name', label: 'Campaign', lock: true }, // keep at least one column visible
    { id: 'status', label: 'Status' },
    { id: 'channel', label: 'Channel' },
    { id: 'clicks', label: 'Clicks' },
    { id: 'installs', label: 'Installs' },
    { id: 'ctr', label: 'CTR' },
    { id: 'cpi', label: 'CPI' },
    { id: 'updatedAt', label: 'Updated' },
  ];

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

          <ColumnsMenu
            visibility={columnVisibility}
            setVisibility={setColumnVisibility}
            columns={columnToggleList}
          />

          <button
            type="button"
            className="h-10 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => alert('Demo: Create Campaign (not implemented)')}
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

      {/* TanStack Table */}
      <div className="rounded-xl bg-white ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-900">Campaign List</div>
          <div className="text-xs text-slate-500">
            {formatNumber(table.getRowModel().rows.length)} results
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted(); // 'asc' | 'desc' | false

                    const metaAlign = (header.column.columnDef.meta as any)?.align as
                      | 'right'
                      | undefined;

                    return (
                      <th
                        key={header.id}
                        className={cn('px-4 py-3', metaAlign === 'right' && 'text-right')}
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                            className={cn(
                              'inline-flex items-center gap-1',
                              canSort ? 'hover:text-slate-900' : 'cursor-default',
                              isSorted ? 'text-slate-900' : 'text-slate-600'
                            )}
                          >
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {canSort ? (
                              <span className="text-[11px] leading-none">
                                {isSorted === 'asc' ? '▲' : isSorted === 'desc' ? '▼' : '↕'}
                              </span>
                            ) : null}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-slate-200">
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelected(row.original)}
                >
                  {row.getVisibleCells().map(cell => {
                    const metaAlign = (cell.column.columnDef.meta as any)?.align as
                      | 'right'
                      | undefined;
                    return (
                      <td
                        key={cell.id}
                        className={cn('px-4 py-3', metaAlign === 'right' && 'text-right')}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-600" colSpan={99}>
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
        <div
          className={cn(
            'absolute inset-0 bg-black/30 transition-opacity',
            selected ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setSelected(null)}
        />
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
                <li>• Table is TanStack-driven (dynamic columns + sorting).</li>
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
