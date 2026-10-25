import { baseApi } from "@/store/api/baseApi";
import { tagTypes } from "@/store/api/tagTypes";
import { clearAuthToken, setAuthToken } from "@/store/api/token";

import {
  isStaff,
  type AuthResult,
  type ChangeEmailPayload,
  type ChangePasswordPayload,
  type ChangePhonePayload,
  type IdentifierPayload,
  type LoginPayload,
  type OtpChallenge,
  type PasswordResetChallenge,
  type ResetPasswordPayload,
  type ResetTokenResult,
  type SessionUser,
  type UpdateMePayload,
  type VerifyCodePayload,
  type VerifyOtpPayload,
} from "../types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResult, LoginPayload>({
      query: (data) => ({ url: "/auth/login", method: "POST", data }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (!isStaff(data.user.userType)) return;

          setAuthToken(data.token);
          dispatch(authApi.util.invalidateTags([tagTypes.session]));
        } catch {}
      },
    }),

    getMe: build.query<SessionUser, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: [tagTypes.session],
    }),

    logout: build.mutation<null, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          clearAuthToken();
          dispatch(authApi.util.invalidateTags([tagTypes.session]));
        }
      },
    }),

    forgotPassword: build.mutation<PasswordResetChallenge, IdentifierPayload>({
      query: (data) => ({ url: "/auth/password/forgot", method: "POST", data }),
    }),

    resendResetCode: build.mutation<PasswordResetChallenge, IdentifierPayload>({
      query: (data) => ({
        url: "/auth/password/forgot/resend",
        method: "POST",
        data,
      }),
    }),

    verifyResetCode: build.mutation<ResetTokenResult, VerifyOtpPayload>({
      query: (data) => ({ url: "/auth/password/verify", method: "POST", data }),
    }),

    resetPassword: build.mutation<null, ResetPasswordPayload>({
      query: (data) => ({ url: "/auth/password/reset", method: "POST", data }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          clearAuthToken();
          dispatch(authApi.util.invalidateTags([tagTypes.session]));
        } catch {}
      },
    }),

    changePassword: build.mutation<null, ChangePasswordPayload>({
      query: (data) => ({ url: "/auth/password/change", method: "POST", data }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          clearAuthToken();
          dispatch(authApi.util.invalidateTags([tagTypes.session]));
        } catch {}
      },
    }),

    updateMe: build.mutation<SessionUser, UpdateMePayload>({
      query: (data) => ({ url: "/users/me", method: "PATCH", data }),
      invalidatesTags: [tagTypes.session],
    }),

    updateMyImage: build.mutation<SessionUser, FormData>({
      query: (data) => ({ url: "/users/me/image", method: "PATCH", data }),
      invalidatesTags: [tagTypes.session],
    }),

    requestEmailChange: build.mutation<OtpChallenge, ChangeEmailPayload>({
      query: (data) => ({ url: "/auth/email/change", method: "POST", data }),
    }),

    resendEmailChangeCode: build.mutation<OtpChallenge, void>({
      query: () => ({ url: "/auth/email/change/resend", method: "POST" }),
    }),

    verifyEmailChange: build.mutation<SessionUser, VerifyCodePayload>({
      query: (data) => ({
        url: "/auth/email/change/verify",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.session],
    }),

    requestPhoneChange: build.mutation<OtpChallenge, ChangePhonePayload>({
      query: (data) => ({ url: "/auth/phone/change", method: "POST", data }),
    }),

    resendPhoneChangeCode: build.mutation<OtpChallenge, void>({
      query: () => ({ url: "/auth/phone/change/resend", method: "POST" }),
    }),

    verifyPhoneChange: build.mutation<SessionUser, VerifyCodePayload>({
      query: (data) => ({
        url: "/auth/phone/change/verify",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.session],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResendResetCodeMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUpdateMeMutation,
  useUpdateMyImageMutation,
  useRequestEmailChangeMutation,
  useResendEmailChangeCodeMutation,
  useVerifyEmailChangeMutation,
  useRequestPhoneChangeMutation,
  useResendPhoneChangeCodeMutation,
  useVerifyPhoneChangeMutation,
} = authApi;
