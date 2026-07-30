import { z } from "zod";

export const agreementActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generate") }),
  z.object({
    action: z.literal("sign"),
    clientSigned: z.literal(true),
    officerSigned: z.literal(true),
  }),
  z.object({ action: z.literal("send_sms") }),
]);

export const releaseOtpRequestSchema = z.object({
  action: z.literal("send"),
});

export const releaseCompleteRequestSchema = z.object({
  otp: z.string().min(4),
  pdi: z.record(z.string(), z.boolean()),
  confirmations: z.record(z.string(), z.boolean()),
  handoverDocumentId: z.string().min(1).optional(),
});

export type AgreementActionRequest = z.infer<typeof agreementActionSchema>;
export type ReleaseOtpRequest = z.infer<typeof releaseOtpRequestSchema>;
export type ReleaseCompleteRequest = z.infer<typeof releaseCompleteRequestSchema>;
