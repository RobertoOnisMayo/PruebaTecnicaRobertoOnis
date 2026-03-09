import React from 'react';

interface SyncButtonProps {
  onSync: () => void;
  isLoading?: boolean;
}

export function SyncButton({ onSync, isLoading }: SyncButtonProps) {
  return (
    <button
      onClick={onSync}
      disabled={isLoading}
      style={{
        padding: '0.5rem 1rem',
        background: '#198754',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      {isLoading ? 'Sincronizando...' : 'Sincronizar datos REE'}
    </button>
  );
}
