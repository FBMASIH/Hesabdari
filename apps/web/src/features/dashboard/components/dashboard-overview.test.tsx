import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { DashboardOverview } from './dashboard-overview';

describe('DashboardOverview', () => {
  it('renders the dashboard heading', () => {
    renderWithProviders(<DashboardOverview />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    renderWithProviders(<DashboardOverview />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Net Income')).toBeInTheDocument();
  });
});
