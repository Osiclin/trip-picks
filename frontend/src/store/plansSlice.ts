import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '@/lib/api';
import type { Plan, CreatePlanData, UpdatePlanData } from '@/types';
import type { RootState } from './index';

interface PlansState {
  currentPlan: Plan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  currentPlan: null,
  isLoading: false,
  error: null,
};

export const fetchPlan = createAsyncThunk(
  'plans/fetch',
  async (id: string, { rejectWithValue }) => {
    try {
      return await api.getPlan(id);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch plan');
    }
  },
);

export const createPlan = createAsyncThunk(
  'plans/create',
  async (data: CreatePlanData, { rejectWithValue }) => {
    try {
      return await api.createPlan(data);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create plan');
    }
  },
);

export const updatePlan = createAsyncThunk(
  'plans/update',
  async ({ id, data }: { id: string; data: UpdatePlanData }, { rejectWithValue }) => {
    try {
      return await api.updatePlan(id, data);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update plan');
    }
  },
);

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    clearCurrentPlan(state) {
      state.currentPlan = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPlan
    builder
      .addCase(fetchPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        state.currentPlan = action.payload;
      })
      .addCase(fetchPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createPlan
    builder
      .addCase(createPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        state.currentPlan = action.payload;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updatePlan
    builder
      .addCase(updatePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        state.currentPlan = action.payload;
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPlan } = plansSlice.actions;

export const selectCurrentPlan = (state: RootState) => state.plans.currentPlan;
export const selectPlanLoading = (state: RootState) => state.plans.isLoading;
export const selectPlanError = (state: RootState) => state.plans.error;

export default plansSlice.reducer;
