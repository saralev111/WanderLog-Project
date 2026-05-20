import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../features/store';

export const journalApi = createApi({
  reducerPath: 'journalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:9090/journals', 
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  
  // 1. הגדרת סוג תג חדש במערכת ה-API
  tagTypes: ['Journals'],
  
  endpoints: (builder) => ({
    getMyEntries: builder.query({
      query: () => '/my-entries',
      // 2. אומרים שהקריאה הזו "משגיחה" על תג Journals
      providesTags: ['Journals'], 
    }),
    
    getPublicEntries: builder.query({
      query: (params) => ({
        url: '/public',
        params: { page: params?.page || 0, size: params?.size || 6 } 
      }),
      providesTags: ['Journals'],
    }),
    
    createEntry: builder.mutation({
      query: (newEntry) => ({
        url: '', 
        method: 'POST',
        body: newEntry,
      }),
      // 3. הקסם: ברגע ששומרים יומן חדש, אנחנו "שוברים" את תג Journals הישן ומכריחים את המערכת להתרענן בלייב!
      invalidatesTags: ['Journals'], 
    }),
    searchByCountry: builder.query({
      query: (country: string) => `/search/country?country=${country}`,
      providesTags: ['Journals'],
    }),

    // חיפוש לפי דירוג (מציג את כל הטיולים מהדירוג הזה ומעלה)
    searchByRating: builder.query({
      query: (minRating: number) => `/search/rating?minRating=${minRating}`,
      providesTags: ['Journals'],
    }),

    // חיפוש חופשי בכותרת או בתיאור
    searchByKeyword: builder.query({
      query: (keyword: string) => `/search/keyword?q=${keyword}`,
      providesTags: ['Journals'],
    }),
    // עדכון יומן מסע קיים
    updateEntry: builder.mutation({
      query: ({ id, updatedEntry }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: updatedEntry,
      }),
      invalidatesTags: ['Journals'], // מרענן אוטומטית את ה-Dashboard לאחר העדכון!
    }),
  }),
  
});

export const { useGetMyEntriesQuery,
   useGetPublicEntriesQuery,
    useCreateEntryMutation,
    useUpdateEntryMutation,
    useSearchByCountryQuery, // התווסף
    useSearchByRatingQuery,  // התווסף
    useSearchByKeywordQuery,  } = journalApi;