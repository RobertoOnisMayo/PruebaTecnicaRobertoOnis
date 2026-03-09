import type { BalanceResponse } from '../types/balance';

const API_BASE = '/api';

function getMockData(startDate: string, endDate: string): BalanceResponse {
  const types = ['Eólica', 'Nuclear', 'Ciclo combinado', 'Solar fotovoltaica', 'Hidráulica', 'Carbón'];
  const colors = ['#6fb114', '#464394', '#ffcc66', '#e48500', '#0090d1', '#993300'];
  const data: BalanceResponse['data'] = [];
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  dates.slice(0, 14).forEach((date) => {
    types.forEach((type, i) => {
      data.push({
        id: `${date}-${type}`,
        datetime: `${date}T12:00:00.000Z`,
        category: 'Renovable',
        type,
        value: Math.round(20000 + Math.random() * 150000),
        percentage: 0.15 + Math.random() * 0.2,
        color: colors[i],
      });
    });
  });
  return {
    data,
    meta: {
      start_date: startDate,
      end_date: endDate,
      records_count: data.length,
      unique_dates: dates.length,
    },
  };
}

export async function fetchBalance(
  startDate: string,
  endDate: string
): Promise<BalanceResponse> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });
  try {
    const res = await fetch(`${API_BASE}/balance?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Error ${res.status}`);
    }
    return res.json();
  } catch {
    const mock = getMockData(startDate, endDate);
    (mock.meta as Record<string, unknown>)._mock = true;
    return mock;
  }
}

export async function triggerSync(
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; stored: number }> {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_date: startDate, end_date: endDate }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}
