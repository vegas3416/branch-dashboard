'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TrendPoint = {
  day: string;
  clicks: number;
  installs: number;
};

const trendData: TrendPoint[] = [
  { day: 'Jan 1', clicks: 820, installs: 240 },
  { day: 'Jan 2', clicks: 910, installs: 260 },
  { day: 'Jan 3', clicks: 760, installs: 210 },
  { day: 'Jan 4', clicks: 980, installs: 290 },
  { day: 'Jan 5', clicks: 1100, installs: 320 },
  { day: 'Jan 6', clicks: 1030, installs: 310 },
  { day: 'Jan 7', clicks: 1220, installs: 360 },
  { day: 'Jan 8', clicks: 1180, installs: 350 },
  { day: 'Jan 9', clicks: 990, installs: 300 },
  { day: 'Jan 10', clicks: 1080, installs: 330 },
  { day: 'Jan 11', clicks: 970, installs: 295 },
  { day: 'Jan 12', clicks: 1150, installs: 340 },
  { day: 'Jan 13', clicks: 1300, installs: 390 },
  { day: 'Jan 14', clicks: 1240, installs: 372 },
];

const channelRows = [
  { channel: 'Paid Ads', clicks: 8420, installs: 2310, cvr: '27.4%' },
  { channel: 'Email', clicks: 3120, installs: 940, cvr: '30.1%' },
  { channel: 'SMS', clicks: 2210, installs: 690, cvr: '31.2%' },
  { channel: 'Social', clicks: 1410, installs: 320, cvr: '22.7%' },
  { channel: 'QR', clicks: 520, installs: 210, cvr: '40.4%' },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="text-2xl font-semibold text-gray-900">Overview</div>
        <div className="text-sm text-gray-600">
          Snapshot of link performance, installs, and channel mix
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Clicks" value="18,420" delta="+6.2%" />
        <KpiCard title="Installs" value="4,812" delta="+3.1%" />
        <KpiCard title="Conversions" value="1,044" delta="+1.8%" />
        <KpiCard title="CVR" value="5.7%" delta="+0.4%" />
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">Performance trend</div>
            <div className="text-xs text-gray-500">Clicks vs Installs</div>
          </div>

          <button className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Export
          </button>
        </div>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
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

      {/* Channel breakdown */}
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium text-gray-900">Channel breakdown</div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Channel</th>
                <th className="py-2 pr-4 font-medium">Clicks</th>
                <th className="py-2 pr-4 font-medium">Installs</th>
                <th className="py-2 pr-4 font-medium">CVR</th>
              </tr>
            </thead>
            <tbody>
              {channelRows.map(r => (
                <tr key={r.channel} className="border-t">
                  <td className="py-2 pr-4 font-medium text-gray-900">{r.channel}</td>
                  <td className="py-2 pr-4 text-gray-700">{r.clicks.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-gray-700">{r.installs.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-gray-700">{r.cvr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, delta }: { title: string; value: string; delta: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{delta}</div>
    </div>
  );
}
