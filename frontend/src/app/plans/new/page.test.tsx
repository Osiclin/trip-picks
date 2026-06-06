import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NewPlanPage from '@/app/plans/new/page';
import savedActivitiesReducer from '@/store/savedActivitiesSlice';
import plansReducer from '@/store/plansSlice';
import * as api from '@/lib/api';

// ── Mock Next.js navigation ───────────────────────────────────────────────────
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ── Mock Sonner toasts ────────────────────────────────────────────────────────
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// ── Mock API ──────────────────────────────────────────────────────────────────
jest.mock('@/lib/api', () => ({
  getActivities: jest.fn(),
  createPlan: jest.fn(),
}));

const mockActivities = [
  {
    id: 'act_001',
    title: 'Nike Art Gallery',
    category: 'Culture',
    area: 'Lekki',
    durationMinutes: 90,
    priceLevel: 2,
    rating: 4.7,
    imageUrl: 'https://example.com/img.jpg',
    description: 'Great gallery',
    tags: ['art'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: { savedActivities: savedActivitiesReducer, plans: plansReducer },
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (api.getActivities as jest.Mock).mockResolvedValue({
    data: mockActivities,
    meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
  });
});

describe('NewPlanPage — create plan form', () => {
  it('renders the form fields', async () => {
    renderWithStore(<NewPlanPage />);

    expect(screen.getByLabelText(/plan name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    renderWithStore(<NewPlanPage />);

    fireEvent.click(screen.getByRole('button', { name: /create plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Plan name is required')).toBeInTheDocument();
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });
  });

  it('shows activity validation error when none selected', async () => {
    renderWithStore(<NewPlanPage />);

    fireEvent.change(screen.getByLabelText(/plan name/i), {
      target: { value: 'My Plan' },
    });
    fireEvent.change(screen.getByLabelText(/^date/i), {
      target: { value: '2025-08-01' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Select at least one activity')).toBeInTheDocument();
    });
  });

  it('loads and displays activities from the API', async () => {
    renderWithStore(<NewPlanPage />);

    await waitFor(() => {
      expect(screen.getByText('Nike Art Gallery')).toBeInTheDocument();
    });

    expect(api.getActivities).toHaveBeenCalledWith({ limit: 100 });
  });
});
