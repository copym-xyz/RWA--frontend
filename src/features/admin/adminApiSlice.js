import { apiSlice } from '../../app/api';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Admin'],
    }),
    getUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['Admin', 'User'],
    }),
    getUserDetails: builder.query({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    getRoles: builder.query({
      query: () => '/admin/roles',
      providesTags: ['Admin'],
    }),
    createRole: builder.mutation({
      query: (data) => ({
        url: '/admin/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    assignRole: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/admin/users/${userId}/roles`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', 'User'],
    }),
    getCredentials: builder.query({
      query: (params) => ({
        url: '/admin/credentials',
        params,
      }),
      providesTags: ['Admin', 'Credential'],
    }),
    getKycVerifications: builder.query({
      query: (params) => ({
        url: '/admin/kyc/verifications',
        params,
      }),
      providesTags: ['Admin', 'KYC'],
    }),
    approveKyc: builder.mutation({
      query: ({ verificationId, ...data }) => ({
        url: `/admin/kyc/approve/${verificationId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', 'KYC'],
    }),
    sendCrossChainMessage: builder.mutation({
      query: (data) => ({
        url: '/admin/cross-chain/message',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admin', 'Bridge'],
    }),
    getIpfsStatus: builder.query({
      query: () => '/admin/ipfs/status',
      providesTags: ['Admin'],
    }),
    getHealth: builder.query({
      query: () => '/admin/health',
      providesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useGetRolesQuery,
  useCreateRoleMutation,
  useAssignRoleMutation,
  useGetCredentialsQuery,
  useGetKycVerificationsQuery,
  useApproveKycMutation,
  useSendCrossChainMessageMutation,
  useGetIpfsStatusQuery,
  useGetHealthQuery,
} = adminApiSlice;