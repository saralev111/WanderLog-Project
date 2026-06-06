import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../features/store';

export const tripApi = createApi({
  reducerPath: 'tripApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:9090/api/trips',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // 1. הגדרת סוג התגית
  tagTypes: ['Trip'], 
  
  endpoints: (builder) => ({
    
    saveTrip: builder.mutation<any, { title: string; journalEntryIds: number[] }>({
      query: (tripData) => ({
        url: '/save-planned',
        method: 'POST',
        body: tripData,
      }),
      // 2. אחרי שהשמירה מצליחה, תפסול את התגית "Trip"
      invalidatesTags: ['Trip'], 
    }),
    updateTrip: builder.mutation<any, { id: number; title: string; journalEntryIds: number[] }>({
      query: ({ id, ...tripData }) => ({
        url: `/update/${id}`,
        method: 'PUT',
        body: tripData,
      }),
      invalidatesTags: ['Trip'], 
    }),
    
    getTrips: builder.query<any[], void>({
        query: () => '/all',
        // 3. תייג את השליפה הזו תחת "Trip" כדי שנדע מתי לרענן אותה
        providesTags: ['Trip'], 
      }),
  }),
});

export const { useSaveTripMutation, useUpdateTripMutation, useGetTripsQuery } = tripApi;