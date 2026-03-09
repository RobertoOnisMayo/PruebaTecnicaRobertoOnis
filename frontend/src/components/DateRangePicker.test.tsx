import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from './DateRangePicker';

describe('DateRangePicker', () => {
  it('renders with start and end date', () => {
    render(
      <DateRangePicker
        startDate="2024-01-01"
        endDate="2024-01-31"
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onFetch={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-31')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /consultar/i })).toBeInTheDocument();
  });

  it('calls onFetch when button is clicked', () => {
    const onFetch = vi.fn();
    render(
      <DateRangePicker
        startDate="2024-01-01"
        endDate="2024-01-31"
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onFetch={onFetch}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /consultar/i }));
    expect(onFetch).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(
      <DateRangePicker
        startDate="2024-01-01"
        endDate="2024-01-31"
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onFetch={vi.fn()}
        isLoading={true}
      />
    );
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled();
  });
});
