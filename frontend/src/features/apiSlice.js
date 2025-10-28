import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './userSlice';

// RTK Query API Slice for all API interactions
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5005/api',
  prepareHeaders: (headers, { getState }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      headers.set('Authorization', `Bearer ${userInfo.token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    if (result.error.data.message === 'Not authorized, token expired') {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Students', 'Teachers', 'Cells', 'Notices', 'Proposals', 'DefenseBoards', 'Rooms', 'ScheduleSlots'],
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
      createProposal: builder.mutation({
        query: (newProposal) => ({
          url: '/proposals',
          method: 'POST',
          body: newProposal,
        }),
        invalidatesTags: ['Proposals'],
      }),
      getProposalsBySupervisor: builder.query({
        query: ({ supervisorId, filter }) => {
          let url = `/proposals/supervisor-proposals`;
          if (filter) {
            url += `?filter=${filter}`;
          }
          return url;
        },
        providesTags: ['Proposals'],
      }),
      getSupervisorPendingProposals: builder.query({
        query: () => '/proposals/supervisor-pending-proposals',
        providesTags: ['Proposals'],
      }),
      updateProposalStatus: builder.mutation({
        query: ({ id, ...data }) => ({
          url: `/proposals/${id}/status`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['Proposals'],
      }),
      getStudentProposals: builder.query({
        query: () => '/proposals/student-proposals',
        providesTags: ['Proposals'],
      }),
      forwardProposal: builder.mutation({
        query: (proposalId) => ({
          url: `/proposals/${proposalId}/forward`,
          method: 'PUT',
        }),
        invalidatesTags: ['Proposals'],
      }),
      getPendingProposalsByCell: builder.query({
        query: () => '/proposals/pending-by-cell',
        providesTags: ['Proposals'],
      }),
      rejectProposal: builder.mutation({
        query: ({ id, feedback }) => ({
          url: `/api/proposals/${id}/reject`,
          method: 'PUT',
          body: { feedback },
        }),
        invalidatesTags: ['Proposals'],
      }),
      createDefenseBoard: builder.mutation({
        query: (newDefenseBoard) => ({
          url: '/defenseboards',
          method: 'POST',
          body: newDefenseBoard,
        }),
        invalidatesTags: ['DefenseBoards'],
      }),
      deleteDefenseBoard: builder.mutation({
        query: (id) => ({
          url: `/defenseboards/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['DefenseBoards'],
      }),
      getAllDefenseBoards: builder.query({
        query: () => '/defenseboards',
        providesTags: ['DefenseBoards'],
      }),
      updateDefenseBoard: builder.mutation({
        query: ({ id, ...data }) => ({
          url: `/defenseboards/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['DefenseBoards'],
      }),
      addOrUpdateComment: builder.mutation({
        query: ({ id, ...data }) => ({
          url: `/defenseboards/${id}/comments`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['DefenseBoards'],
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
        providesTags: ['Notice'],
      }),
      getNoticeById: builder.query({
        query: (id) => `/notices/${id}`,
        providesTags: (result, error, id) => [{ type: 'Notice', id }],
      }),
      createNotice: builder.mutation({
        query: (newNotice) => ({
          url: '/notices',
          method: 'POST',
          body: newNotice,
        }),
        invalidatesTags: ['Notice'],
      }),
      updateNotice: builder.mutation({
        query: ({ id, updatedNotice }) => ({
          url: `/notices/${id}`,
          method: 'PUT',
          body: updatedNotice,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'Notice', id }],
      }),
      markNoticeAsRead: builder.mutation({
        query: (id) => ({
          url: `/notices/mark-as-read/${id}`,
          method: 'PUT',
        }),
        invalidatesTags: (result, error, id) => [{ type: 'Notice', id }],
      }),
      deleteNotice: builder.mutation({
        query: (id) => ({
          url: `/notices/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Notice'],
      }),
      getSupervisorDefenseSchedule: builder.query({
        query: () => '/defenseboards/supervisor-schedule',
        providesTags: ['DefenseBoards'],
      }),
      getSupervisorDefenseResults: builder.query({
        query: () => '/defenseboards/supervisor-results',
        providesTags: ['DefenseBoards'],
      }),
      getStudentDefenseSchedule: builder.query({
        query: (defenseType) => {
          let url = '/defenseboards/student-schedule';
          if (defenseType) {
            url += `?defenseType=${defenseType}`;
          }
          return url;
        },
        providesTags: ['DefenseBoards'],
      }),
      getRooms: builder.query({
        query: () => '/rooms',
        providesTags: ['Rooms'],
      }),
      addRoom: builder.mutation({
        query: (room) => ({
          url: '/rooms',
          method: 'POST',
          body: room,
        }),
        invalidatesTags: ['Rooms'],
      }),
      updateRoom: builder.mutation({
        query: ({ id, ...data }) => ({
          url: `/rooms/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['Rooms'],
      }),
      deleteRoom: builder.mutation({
        query: (id) => ({
          url: `/rooms/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Rooms'],
      }),
      getScheduleSlots: builder.query({
        query: () => '/schedule-slots',
        providesTags: ['ScheduleSlots'],
      }),
      addScheduleSlot: builder.mutation({
        query: (slot) => ({
          url: '/schedule-slots',
          method: 'POST',
          body: slot,
        }),
        invalidatesTags: ['ScheduleSlots'],
      }),
      updateScheduleSlot: builder.mutation({
        query: ({ id, ...data }) => ({
          url: `/schedule-slots/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['ScheduleSlots'],
      }),
      deleteScheduleSlot: builder.mutation({
        query: (id) => ({
          url: `/schedule-slots/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['ScheduleSlots'],
      }),
      getProposals: builder.query({
        query: () => '/proposals',
        providesTags: ['Proposals'],
      }),
      getAvailableProposals: builder.query({
        query: () => '/proposals/available-proposals',
        providesTags: ['Proposals'],
      }),
    }),
    extraReducers: (builder) => {
      builder.addMatcher(apiSlice.endpoints.logout.match, (state, action) => {
        // Clear all cached data when logout occurs
        // This is handled by api.util.resetApiState() which is dispatched by the logout action itself
        // No need to do anything here directly, as the logout action already dispatches resetApiState
      });
    },
  });
  
  export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetUsersQuery,
    useGetUserDetailsQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetStudentsQuery,
    useGetTeachersQuery,
    useGetProposalsQuery,
    useGetProposalByIdQuery,
    useCreateProposalMutation,
    useUpdateProposalMutation,
    useDeleteProposalMutation,
    useGetProposalsBySupervisorQuery,
    useGetSupervisorPendingProposalsQuery,
    useUpdateProposalStatusMutation,
    useForwardProposalMutation,
    useGetPendingProposalsByCellQuery,
    useRejectProposalMutation,
    useCreateDefenseBoardMutation,
    useDeleteDefenseBoardMutation,
    useGetAllDefenseBoardsQuery,
    useUpdateDefenseBoardMutation,
    useAddOrUpdateCommentMutation,
    useGetGroupsQuery,
    useGetGroupByIdQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useAssignBoardMembersMutation,
    useAssignGroupsMutation,
    useGetResearchCellsQuery,
    useCreateCommitteeNoticeMutation,
    useGetCommitteeSentNoticesQuery,
    useSendNoticeToGroupMutation,
    useGetSupervisorSentNoticesQuery,
    useGetNoticesQuery,
    useGetNoticeByIdQuery,
    useCreateNoticeMutation,
    useMarkNoticeAsReadMutation,
    useUpdateNoticeMutation,
    useDeleteNoticeMutation,
    useGetSupervisorDefenseScheduleQuery,
    useGetSupervisorDefenseResultQuery,
    useUpdateSupervisorCommentMutation,
    useGetStudentDefenseScheduleQuery,
    useGetStudentProposalsQuery,
    useGetSupervisorProposalsQuery,
    useGetRoomsQuery,
    useAddRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useGetScheduleSlotsQuery,
    useAddScheduleSlotMutation,
    useUpdateScheduleSlotMutation,
    useDeleteScheduleSlotMutation,
    useGetAvailableProposalsQuery,
  } = apiSlice;
  
  
