import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onFetch: () => void;
  isLoading?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFetch,
  isLoading,
}: DateRangePickerProps) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <label>
        Desde:
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
        />
      </label>
      <label>
        Hasta:
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
        />
      </label>
      <button
        onClick={onFetch}
        disabled={isLoading}
        style={{
          padding: '0.5rem 1rem',
          background: '#0d6efd',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Cargando...' : 'Consultar'}
      </button>
    </div>
  );
}
