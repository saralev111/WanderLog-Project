import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'; 
import type { RootState } from '../../features/store';
import { logout } from '../../features/authSlice'; 

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:9090/journals', 
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // קודם כל, מוציאים את הבקשה לשרת כרגיל
  let result = await baseQuery(args, api, extraOptions);

  // בודקים אם יש שגיאה, ואם הקוד שלה הוא 401
  if (result.error && result.error.status === 401) {
    // השרת אמר שהטוקן פג תוקף! מפעילים מיד את פקודת ההתנתקות
    api.dispatch(logout());
  }
  return result;
};

export const journalApi = createApi({
  reducerPath: 'journalApi',
  baseQuery: baseQueryWithReauth, 
  
  tagTypes: ['Journals'],
  
  endpoints: (builder) => ({
    getMyEntries: builder.query({
      query: () => '/my-entries',
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
      invalidatesTags: ['Journals'], 
    }),
    
    searchByCountry: builder.query({
      query: (country: string) => `/search/country?country=${country}`,
      providesTags: ['Journals'],
    }),

    searchByRating: builder.query({
      query: (minRating: number) => `/search/rating?minRating=${minRating}`,
      providesTags: ['Journals'],
    }),

    searchByKeyword: builder.query({
      query: (keyword: string) => `/search/keyword?q=${keyword}`,
      providesTags: ['Journals'],
    }),
    
    updateEntry: builder.mutation({
      query: ({ id, updatedEntry }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: updatedEntry,
      }),
      invalidatesTags: ['Journals'],
    }),

    updateEntryWithImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}/with-image`, // פונה לנתיב החדש שיצרנו בשרת
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Journals'],
    }),

    deleteEntry: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Journals'], // מרענן את רשימת היומנים אוטומטית אחרי המחיקה
    }),
    
    optimizeRoute: builder.mutation({
      query: (places) => ({
        url: '/optimize-route',
        method: 'POST',
        body: places,
      }),
    }),
    
    createEntryWithImage: builder.mutation({
      query: (formData: FormData) => ({
        url: '/with-image', // פונה לנתיב המיוחד בשרת שמטפל בתמונות
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Journals'], 
    }),

    // --- הוספנו את ה-AI כאן ---
    getAiAdvice: builder.mutation({
      query: (ids: number[]) => ({
        url: '/ai-advice',
        method: 'POST',
        body: ids,
        responseHandler: 'text', // חובה כדי שהשרת יוכל להחזיר טקסט רגיל
      }),
    }),
    
  }),
});

export const { 
  useGetMyEntriesQuery,
  useGetPublicEntriesQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useCreateEntryWithImageMutation,
  useSearchByCountryQuery,
  useSearchByRatingQuery,
  useSearchByKeywordQuery,
  useOptimizeRouteMutation,
  useGetAiAdviceMutation, 
  useUpdateEntryWithImageMutation,
  useDeleteEntryMutation,
} = journalApi;