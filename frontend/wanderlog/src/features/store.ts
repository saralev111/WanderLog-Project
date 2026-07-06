import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../app/api/authApi';
import { journalApi } from '../app/api/journalApi'; 
import authReducer from './authSlice';
import { adminApi } from '../app/api/adminApi';
import routeReducer from './routeSlice';
import { tripApi } from '../app/api/tripApi'; 

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [journalApi.reducerPath]: journalApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer, 
    [tripApi.reducerPath]: tripApi.reducer,
    auth: authReducer,
    route: routeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, journalApi.middleware,adminApi.middleware, tripApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;