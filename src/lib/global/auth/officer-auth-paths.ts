/** Upstream officer auth paths (append to JIWAMBE_API_BASE_URL). */
export const OFFICER_AUTH_UPSTREAM = {
  login: "/onboarding/auth/login",
  otpVerify: "/onboarding/auth/otp/verify",
  activate: "/onboarding/auth/activate",
  activatePassword: "/onboarding/auth/activate/password",
  passwordForgot: "/onboarding/auth/password/forgot",
  passwordReset: "/onboarding/auth/password/reset",
  passwordResetPassword: "/onboarding/auth/password/reset/password",
  otpResend: "/onboarding/auth/otp/resend",
  logout: "/onboarding/auth/logout",
  refresh: "/onboarding/auth/refresh",
} as const;
