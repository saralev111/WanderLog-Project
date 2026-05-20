import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../app/api/authApi';
import { journalApi } from '../app/api/journalApi'; // הוספנו את הייבוא הזה
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [journalApi.reducerPath]: journalApi.reducer, // רשמנו את ה-API של היומנים
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    // חיברנו גם את המידלוור של היומנים
    getDefaultMiddleware().concat(authApi.middleware, journalApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;