'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOverview } from '@/lib/overview.client';
import { OverviewChart } from '@/components/OverviewChart';

function formatNumber(n: number) {
  return Intl.NumberFormat().format(n);
}

function formatPct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export default function OverviewPage() {
  const [range, setRange] = useState<'30d' | '7d'>('30d');

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['overview', range],
    queryFn: () => fetchOverview(range),
    staleTime: 60_000, // 1 minute fresh
    retry: 1,
  });

  const loading = isLoading; // keep your existing variable name
  const err = isError ? (error as Error).message : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Overview</div>
          <div className="text-sm text-gray-600">
            KPIs and trends pulled from a mock API route
            {isFetching && !isLoading ? ' • updating…' : ''}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRange('7d')}
            className={`rounded-lg border border-border px-3 py-2 text-sm bg-card hover:bg-muted ${
              range === '7d' ? 'bg-muted' : ''
            }`}
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setRange('30d')}
            className={`rounded-lg border border-border px-3 py-2 text-sm bg-card hover:bg-muted ${
              range === '30d' ? 'bg-muted' : ''
            }`}
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{err}</span>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Clicks" value={formatNumber(data?.kpis.clicks ?? 0)} loading={loading} />
        <KpiCard
          title="Installs"
          value={formatNumber(data?.kpis.installs ?? 0)}
          loading={loading}
        />
        <KpiCard title="CTR" value={formatPct(data?.kpis.ctr ?? 0)} loading={loading} />
        <KpiCard title="CPI" value={`$${(data?.kpis.cpi ?? 0).toFixed(2)}`} loading={loading} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Trend</div>
            <div className="text-xs text-muted-foreground">
              {isLoading ? 'Loading series…' : `${data?.series.length ?? 0} points`}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {isFetching && !isLoading ? 'Updating…' : ''}
          </div>
        </div>

        <div className="mt-4">
          <OverviewChart data={data?.series} loading={isLoading} />
        </div>
        <div className="flex justify-end text-xs text-muted-foreground">
          Last updated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : '-'}
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, loading }: { title: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">
        {loading ? (
          <span className="inline-block h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          value
        )}
      </div>
    </div>
  );
}
