'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { OverviewResponse } from '@/lib/overview.types';

function fmtShortDate(iso: string) {
  // iso: YYYY-MM-DD → MM/DD
  const m = iso.slice(5, 7);
  const d = iso.slice(8, 10);
  return `${m}/${d}`;
}

export function OverviewChart({
  data,
  loading,
}: {
  data: OverviewResponse['series'] | undefined;
  loading: boolean;
}) {
  if (loading) {
    return <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />;
  }

  if (!data?.length) {
    return (
      <div className="h-64 w-full rounded-xl border border-border bg-card flex items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={fmtShortDate} />
          <YAxis />
          <Tooltip
            labelFormatter={v => `Date: ${v}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [value, name]}
          />
          <Line type="monotone" dataKey="clicks" dot={false} />
          <Line type="monotone" dataKey="installs" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
