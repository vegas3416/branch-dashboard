// app/api/overview/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { OverviewResponse } from './../../../lib/overview.types';

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // optional query param: ?range=7d
  const { searchParams } = new URL(req.url);
  const rangeParam = searchParams.get('range');
  const range: OverviewResponse['range'] = rangeParam === '7d' ? 'last_7_days' : 'last_30_days';

  // simulate backend latency so loading states are visible
  await sleep(1200);

  const days = range === 'last_7_days' ? 7 : 30;

  // generate deterministic-ish fake data
  const today = new Date();
  const series: OverviewResponse['series'] = [];

  let totalClicks = 0;
  let totalInstalls = 0;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const date = d.toISOString().slice(0, 10);

    // simple wave + noise
    const base = range === 'last_7_days' ? 900 : 650;
    const wave = Math.sin((i / days) * Math.PI * 2) * 120;
    const noise = Math.floor((i * 37) % 90);

    const clicks = Math.max(120, Math.floor(base + wave + noise));
    const installs = Math.max(15, Math.floor(clicks * 0.09) - (i % 7));

    totalClicks += clicks;
    totalInstalls += installs;

    series.push({ date, clicks, installs });
  }

  const ctr = totalClicks === 0 ? 0 : Math.min(1, totalInstalls / totalClicks);
  const cpi = totalInstalls === 0 ? 0 : Number((2.75 + (days === 7 ? 0.4 : 0)).toFixed(2));

  const data: OverviewResponse = {
    range,
    kpis: {
      clicks: totalClicks,
      installs: totalInstalls,
      ctr,
      cpi,
    },
    series,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
