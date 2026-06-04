import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
// המבנה של יעד במסלול - אנחנו צריכים בעיקר את המזהה, השם, והמיקום כדי לצייר על המפה
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
    // פעולה זו תוסיף יעד למסלול, ואם הוא כבר שם - היא תסיר אותו (כמו מתג הדלקה/כיבוי)
    toggleRouteEntry: (state, action: PayloadAction<RouteEntry>) => {
      const exists = state.selectedEntries.find(entry => entry.id === action.payload.id);
      if (exists) {
        state.selectedEntries = state.selectedEntries.filter(entry => entry.id !== action.payload.id);
      } else {
        state.selectedEntries.push(action.payload);
      }
    },
    // פעולה לעדכון הסדר של הרשימה (נשתמש בה בשלב של הגרירה או האלגוריתם)
    updateRouteOrder: (state, action: PayloadAction<RouteEntry[]>) => {
      state.selectedEntries = action.payload;
    },
    // ניקוי המסלול לחלוטין
    clearRoute: (state) => {
      state.selectedEntries = [];
    }
  },
});

export const { toggleRouteEntry, updateRouteOrder, clearRoute } = routeSlice.actions;
export default routeSlice.reducer;