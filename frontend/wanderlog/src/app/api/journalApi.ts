import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../features/store';

export const journalApi = createApi({
  reducerPath: 'journalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:9090/journals', // נתיב הקונטרולר של היומנים ב-Spring Boot
    
    // כאן אנחנו מזריקים את הטוקן (JWT) לכל בקשה באופן אוטומטי
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  
  endpoints: (builder) => ({
    // שליפת היומנים של המשתמש המחובר (נשתמש בזה בהמשך באזור האישי)
    getMyEntries: builder.query({
      query: () => '/my-entries',
    }),
    // שליפת יומנים ציבוריים - בזה אנחנו משתמשים עכשיו בדף הבית!
    getPublicEntries: builder.query({
      query: (params) => ({
        url: '/public',
        params: { page: params?.page || 0, size: params?.size || 6 } // תמיכה בדפדוף (Pagination)
      }),
    }),
  }),
});

// RTK Query מייצר לנו הוקים אוטומטיים שבהם נשתמש בקומפוננטות
export const { useGetMyEntriesQuery, useGetPublicEntriesQuery } = journalApi;