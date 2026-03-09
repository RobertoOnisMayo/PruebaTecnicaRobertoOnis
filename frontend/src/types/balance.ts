export interface BalanceRecord {
  id: string;
  datetime: string;
  category: string;
  type: string;
  value: number;
  percentage: number | null;
  color: string | null;
}

export interface BalanceResponse {
  data: BalanceRecord[];
  meta: {
    start_date: string;
    end_date: string;
    records_count: number;
    unique_dates: number;
    _mock?: boolean;
  };
}
