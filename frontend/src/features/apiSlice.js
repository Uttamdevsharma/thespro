import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000',
    prepareHeaders: (headers, { getState }) => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        headers.set('Authorization', `Bearer ${userInfo.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Students', 'Teachers', 'Cells', 'Notices'],
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: () => '/students',
      providesTags: ['Students'],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/students/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Students'],
    }),
    getTeachers: builder.query({
      query: () => '/teachers',
      providesTags: ['Teachers'],
    }),
    addTeacher: builder.mutation({
      query: (teacher) => ({
        url: '/teachers',
        method: 'POST',
        body: teacher,
      }),
      invalidatesTags: ['Teachers'],
    }),
    assignCell: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teachers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Teachers'],
    }),
    getResearchCells: builder.query({
      query: () => '/researchCells',
      providesTags: ['Cells'],
    }),
    addResearchCell: builder.mutation({
      query: (cell) => ({
        url: '/researchCells',
        method: 'POST',
        body: cell,
      }),
      invalidatesTags: ['Cells'],
    }),
    // Notice Endpoints
    createNotice: builder.mutation({
      query: (noticeData) => ({
        url: '/api/notices',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['Notices'],
    }),
    getNotices: builder.query({
      query: () => '/api/notices',
      providesTags: ['Notices'],
    }),
    getNoticeById: builder.query({
      query: (id) => `/api/notices/${id}`,
      providesTags: (result, error, id) => [{
        type: 'Notices',
        id
      }],
    }),
    markNoticeAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/notices/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{
        type: 'Notices',
        id
      }],
    }),
    deleteNotice: builder.mutation({
      query: (id) => ({
        url: `/api/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notices'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useUpdateStudentMutation,
  useGetTeachersQuery,
  useAddTeacherMutation,
  useAssignCellMutation,
  useGetResearchCellsQuery,
  useAddResearchCellMutation,
  useCreateNoticeMutation,
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useMarkNoticeAsReadMutation,
  useDeleteNoticeMutation,
} = apiSlice;