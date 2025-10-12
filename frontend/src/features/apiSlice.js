import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        headers.set('Authorization', `Bearer ${userInfo.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Students', 'Teachers', 'Cells', 'Notices', 'Proposals'],
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: () => '/users/students',
      providesTags: ['Students'],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/students/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Students'],
    }),
    getTeachers: builder.query({
      query: () => '/users/supervisors',
      providesTags: ['Teachers'],
    }),
    addTeacher: builder.mutation({
      query: (teacher) => ({
        url: '/users/add-supervisor',
        method: 'POST',
        body: teacher,
      }),
      invalidatesTags: ['Teachers'],
    }),
    assignCell: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}/assign-cell`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Teachers'],
    }),
    getResearchCells: builder.query({
      query: () => '/researchcells',
      providesTags: ['Cells'],
    }),
    addResearchCell: builder.mutation({
      query: (cell) => ({
        url: '/researchcells',
        method: 'POST',
        body: cell,
      }),
      invalidatesTags: ['Cells'],
    }),
    getProposalsBySupervisor: builder.query({
      query: (id) => `/proposals/supervisor-proposals`,
      providesTags: ['Proposals'],
    }),
    // Notice Endpoints
    createCommitteeNotice: builder.mutation({
      query: (noticeData) => ({
        url: '/notices/committee',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['Notices'],
    }),
    getCommitteeSentNotices: builder.query({
      query: () => '/notices/committee/sent',
      providesTags: ['Notices'],
    }),
    sendNoticeToGroup: builder.mutation({
      query: (noticeData) => ({
        url: '/notices/supervisor',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['Notices'],
    }),
    getSupervisorSentNotices: builder.query({
      query: () => '/notices/supervisor/sent',
      providesTags: ['Notices'],
    }),
    getNotices: builder.query({
      query: (userId) => `/notices?userId=${userId}`,
      providesTags: ['Notices'],
    }),
    getProposals: builder.query({
      query: () => '/proposals',
      providesTags: ['Proposals'],
    }),
    getNoticeById: builder.query({
      query: (id) => `/notices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Notices', id }],
    }),
    markNoticeAsRead: builder.mutation({
      query: (id) => ({
        url: `/notices/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notices'],
    }),
    deleteNotice: builder.mutation({
      query: (id) => ({
        url: `/notices/${id}`,
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
  useGetProposalsBySupervisorQuery,
  useCreateCommitteeNoticeMutation,
  useGetCommitteeSentNoticesQuery,
  useSendNoticeToGroupMutation,
  useGetSupervisorSentNoticesQuery,
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useMarkNoticeAsReadMutation,
  useDeleteNoticeMutation,
} = apiSlice;