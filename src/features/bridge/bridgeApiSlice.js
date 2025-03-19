import { apiSlice } from '../../app/api';

export const bridgeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestVerification: builder.mutation({
      query: (data) => ({
        url: '/identity/admin/resolve-did',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bridge'],
    }),
    getVerificationStatus: builder.query({
      query: (requestId) => `/admin/verification/${requestId}`,
      providesTags: (result, error, id) => [{ type: 'Bridge', id }],
    }),
    bridgeTokens: builder.mutation({
      query: (data) => ({
        url: '/bridge/tokens',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bridge'],
    }),
    getTokenTransferStatus: builder.query({
      query: (transferId) => `/bridge/transfer/${transferId}`,
      providesTags: (result, error, id) => [{ type: 'Bridge', id }],
    }),
    getBridgeEndpoints: builder.query({
      query: () => '/admin/bridge/endpoints',
      providesTags: ['Bridge'],
    }),
  }),
});

export const {
  useRequestVerificationMutation,
  useGetVerificationStatusQuery,
  useBridgeTokensMutation,
  useGetTokenTransferStatusQuery,
  useGetBridgeEndpointsQuery,
} = bridgeApiSlice;