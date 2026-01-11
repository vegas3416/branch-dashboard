export type OverviewResponse = {
  range: 'last_30_days' | 'last_7_days';
  kpis: { clicks: number; installs: number; ctr: number; cpi: number };
  series: Array<{ date: string; clicks: number; installs: number }>;
  generatedAt: string;
};
