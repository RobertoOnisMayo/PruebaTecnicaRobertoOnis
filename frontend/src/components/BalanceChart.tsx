import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { BalanceRecord } from '../types/balance';

function groupByDate(records: BalanceRecord[]) {
  const byDate: Record<string, Record<string, number>> = {};
  for (const r of records) {
    const date = r.datetime.slice(0, 10);
    if (!byDate[date]) byDate[date] = {};
    byDate[date][r.type] = (byDate[date][r.type] || 0) + Number(r.value);
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));
}

function getUniqueTypes(records: BalanceRecord[]) {
  const types = new Set<string>();
  for (const r of records) {
    if (!r.type.includes('Generación') && !r.type.includes('Saldo')) {
      types.add(r.type);
    }
  }
  return Array.from(types).slice(0, 10);
}

const COLORS = [
  '#0090d1',
  '#6fb114',
  '#e48500',
  '#464394',
  '#ffcc66',
  '#993300',
  '#9a5cbc',
  '#007cf9',
  '#00608a',
  '#cfa2ca',
];

interface BalanceChartProps {
  records: BalanceRecord[];
}

export function BalanceChart({ records }: BalanceChartProps) {
  if (records.length === 0) return null;

  const chartData = groupByDate(records);
  const types = getUniqueTypes(records);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {types.map((type, i) => (
            <Bar
              key={type}
              dataKey={type}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              stackId="a"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
