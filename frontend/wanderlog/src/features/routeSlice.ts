import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface RouteEntry {
  id: number;
  title: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

interface RouteState {
  selectedEntries: RouteEntry[];
}

const initialState: RouteState = {
  selectedEntries: [],
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    toggleRouteEntry: (state, action: PayloadAction<RouteEntry>) => {
      const exists = state.selectedEntries.find(entry => entry.id === action.payload.id);
      if (exists) {
        state.selectedEntries = state.selectedEntries.filter(entry => entry.id !== action.payload.id);
      } else {
        state.selectedEntries.push(action.payload);
      }
    },
    updateRouteOrder: (state, action: PayloadAction<RouteEntry[]>) => {
      state.selectedEntries = action.payload;
    },
    clearRoute: (state) => {
      state.selectedEntries = [];
    },
    loadTripForEdit: (state, action: PayloadAction<RouteEntry[]>) => {
      state.selectedEntries = action.payload;
    }
  },
});

export const { toggleRouteEntry, updateRouteOrder, clearRoute, loadTripForEdit } = routeSlice.actions;
export default routeSlice.reducer;