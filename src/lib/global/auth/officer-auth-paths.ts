/** Upstream officer auth paths (append to JIWAMBE_API_BASE_URL). */
export const OFFICER_AUTH_UPSTREAM = {
  login: "/v1/_demo/auth/login",
  otpVerify: "/v1/_demo/auth/otp/verify",
  activate: "/v1/_demo/auth/activate",
  activatePassword: "/v1/_demo/auth/activate/password",
  passwordForgot: "/v1/_demo/auth/password/forgot",
  passwordReset: "/v1/_demo/auth/password/reset",
  passwordResetPassword: "/v1/_demo/auth/password/reset/password",
  passwordChange: "/v1/_demo/auth/password/change",
  otpResend: "/v1/_demo/auth/otp/resend",
  logout: "/v1/field/auth/logout",
  refresh: "/v1/field/auth/refresh",
} as const;

/** Field realm upstream paths for authenticated BFF proxies. */
export const FIELD_UPSTREAM = {
  authMe: "/v1/field/auth/me",
  applications: "/v1/field/applications",
  applicationsCurrent: "/v1/field/applications/current",
  customersSearch: "/v1/field/customers/search",
  products: "/v1/field/products",
  productsQuote: "/v1/field/products/quote",
  productsPricingRules: "/v1/field/products/pricing-rules",
  bikesAssignable: "/v1/field/bikes/assignable",
  paymentsStk: "/v1/field/payments/stk",
  paymentsValidate: "/v1/field/payments/validate",
} as const;
