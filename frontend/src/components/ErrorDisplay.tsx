import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div
      style={{
        padding: '1rem',
        background: '#fee',
        border: '1px solid #c00',
        borderRadius: '8px',
        color: '#c00',
        margin: '1rem 0',
      }}
    >
      <strong>Error:</strong> {message}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginLeft: '1rem',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
