import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../features/store';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    // נתיב הבסיס כפי שהגדרת במשימה
    baseUrl: 'http://localhost:9090/api/admin',
    prepareHeaders: (headers, { getState }) => {
      // אנחנו מוסיפים את הטוקן לכל בקשה, כי רק מנהלים מחוברים רשאים לגשת לכאן!
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // קריאה לשליפת כל המשתמשים
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users'],
    }),

    // קריאה למחיקת משתמש (מוכנה מראש לחלק הבא שלנו)
    deleteUser: builder.mutation({
      query: (userId: number) => ({
        url: `/user/${userId}`,
        method: 'DELETE',
      }),
      // הקסם: אחרי מחיקה, אנו "שוברים" את התג כדי שהטבלה תתרענן לבד!
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { useGetAllUsersQuery, useDeleteUserMutation } = adminApi;