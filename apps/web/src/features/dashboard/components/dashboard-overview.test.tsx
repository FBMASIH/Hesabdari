import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { DashboardOverview } from './dashboard-overview';

describe('DashboardOverview', () => {
  it('renders the dashboard heading', () => {
    renderWithProviders(<DashboardOverview />);
    expect(screen.getByText('داشبورد مالی')).toBeInTheDocument();
  });

  it('renders KPI strip with metrics', () => {
    renderWithProviders(<DashboardOverview />);
    expect(screen.getByText('فروش روز')).toBeInTheDocument();
    expect(screen.getByText('کارتخوان')).toBeInTheDocument();
  });

  it('renders chart section', () => {
    renderWithProviders(<DashboardOverview />);
    expect(screen.getByText('روند کلی پول')).toBeInTheDocument();
  });

  it('renders money summary', () => {
    renderWithProviders(<DashboardOverview />);
    expect(screen.getByText('خلاصه پول')).toBeInTheDocument();
  });
});
