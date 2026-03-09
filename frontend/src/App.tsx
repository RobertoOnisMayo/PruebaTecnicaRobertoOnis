import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBalance, triggerSync } from './api/balance';
import { DateRangePicker } from './components/DateRangePicker';
import { BalanceChart } from './components/BalanceChart';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SyncButton } from './components/SyncButton';

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function App() {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState(formatDate(new Date()));

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['balance', startDate, endDate],
    queryFn: () => fetchBalance(startDate, endDate),
    enabled: false,
  });

  const syncMutation = useMutation({
    mutationFn: () => triggerSync(startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      refetch();
    },
  });

  const handleFetch = () => refetch();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>
          Balance Eléctrico REE
        </h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Datos de generación y demanda eléctrica en España
        </p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFetch={handleFetch}
          isLoading={isLoading}
        />
        <SyncButton
          onSync={() => syncMutation.mutate()}
          isLoading={syncMutation.isPending}
        />
      </div>

      {isError && (
        <ErrorDisplay
          message={error instanceof Error ? error.message : 'Error desconocido'}
          onRetry={handleFetch}
        />
      )}

      {isLoading && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Cargando datos...
        </div>
      )}

      {data && !isLoading && (
        <>
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: data.meta._mock ? '#fff3cd' : '#e8f4fd',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            {data.meta._mock && (
              <strong style={{ color: '#856404' }}>Modo demo: </strong>
            )}
            <strong>{data.meta.records_count}</strong> registros entre{' '}
            <strong>{data.meta.start_date}</strong> y{' '}
            <strong>{data.meta.end_date}</strong> ({data.meta.unique_dates}{' '}
            días)
          </div>
          <BalanceChart records={data.data} />
        </>
      )}

      {!data && !isLoading && !isError && (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#666',
            background: '#f1f5f9',
            borderRadius: '8px',
          }}
        >
          Selecciona un rango de fechas y pulsa "Consultar" para ver los datos.
          Si no hay datos, usa "Sincronizar datos REE" para obtenerlos desde la
          API de REE.
        </div>
      )}
    </div>
  );
}

export default App;
