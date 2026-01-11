import type { OverviewResponse } from './overview.types';

export async function fetchOverview ( range: '7d' | '30d' )
{
  const qs = range === '7d' ? '?range=7d' : '';
  const res = await fetch(`/api/overview${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as OverviewResponse;
}

