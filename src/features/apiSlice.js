
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000' }),
  tagTypes: ['Students', 'Teachers', 'Cells'],
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
} = apiSlice;
