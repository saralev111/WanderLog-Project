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
  endpoints: (builder) => ({
    // כאן התבצע התיקון: שינינו את locations ל- journalEntryIds
    saveTrip: builder.mutation<any, { title: string; journalEntryIds: number[] }>({
      query: (tripData) => ({
        url: '/save-planned',
        method: 'POST',
        body: tripData,
      }),
    }),
    getTrips: builder.query<any[], void>({
        query: () => '/all',
      }),
  }),
});

export const { useSaveTripMutation, useGetTripsQuery } = tripApi;