import { apiSlice } from '../../app/api';

export const credentialsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    issueCredential: builder.mutation({
      query: (data) => ({
        url: '/credential/issue',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Credential'],
    }),
    verifyCredential: builder.mutation({
      query: (data) => ({
        url: '/credential/verify',
        method: 'POST',
        body: data,
      }),
    }),
    revokeCredential: builder.mutation({
      query: (data) => ({
        url: '/credential/revoke',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Credential'],
    }),
    getCredential: builder.query({
      query: (credentialHash) => `/credential/${credentialHash}`,
      providesTags: (result, error, hash) => [{ type: 'Credential', id: hash }],
    }),
    getCredentialsForSubject: builder.query({
      query: (did) => `/credential/subject/${did}`,
      providesTags: ['Credential'],
    }),
    getCredentialsBySBT: builder.query({
      query: (tokenId) => `/credential/sbt/${tokenId}`,
      providesTags: ['Credential'],
    }),
    verifyCrossChain: builder.mutation({
      query: (data) => ({
        url: '/credential/verify-cross-chain',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useIssueCredentialMutation,
  useVerifyCredentialMutation,
  useRevokeCredentialMutation,
  useGetCredentialQuery,
  useGetCredentialsForSubjectQuery,
  useGetCredentialsBySBTQuery,
  useVerifyCrossChainMutation,
} = credentialsApiSlice;