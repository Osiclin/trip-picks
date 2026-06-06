import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { Activity } from '@/types';

interface SavedActivitiesState {
  /** Full Activity objects stored so /saved page works without re-fetching */
  activities: Activity[];
}

const initialState: SavedActivitiesState = {
  activities: [],
};

const savedActivitiesSlice = createSlice({
  name: 'savedActivities',
  initialState,
  reducers: {
    saveActivity(state, action: PayloadAction<Activity>) {
      const exists = state.activities.some((a) => a.id === action.payload.id);
      if (!exists) {
        state.activities.push(action.payload);
      }
    },
    unsaveActivity(state, action: PayloadAction<string>) {
      state.activities = state.activities.filter((a) => a.id !== action.payload);
    },
    /** Restore from localStorage on client mount */
    rehydrate(state, action: PayloadAction<Activity[]>) {
      state.activities = action.payload;
    },
  },
});

export const { saveActivity, unsaveActivity, rehydrate } = savedActivitiesSlice.actions;

export const selectSavedActivities = (state: RootState) =>
  state.savedActivities.activities;

export const selectIsSaved = (id: string) => (state: RootState) =>
  state.savedActivities.activities.some((a) => a.id === id);

export default savedActivitiesSlice.reducer;
