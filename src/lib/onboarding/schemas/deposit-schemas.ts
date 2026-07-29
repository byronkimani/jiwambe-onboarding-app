import { z } from "zod";

export const depositStkRequestSchema = z.object({
  applicationReferenceCode: z.string().min(1),
  depositKes: z.number().int().positive(),
  phone: z.string().optional(),
});

export const depositStkStatusSchema = z.enum(["initiated", "waiting"]);

export const depositStkResponseSchema = z.object({
  checkoutId: z.string().min(1),
  status: depositStkStatusSchema,
  expiresAt: z.string().optional(),
});

export const depositValidateRequestSchema = z
  .object({
    applicationReferenceCode: z.string().min(1),
    checkoutId: z.string().min(1).optional(),
    mpesaReceipt: z.string().min(10).optional(),
  })
  .refine((data) => Boolean(data.checkoutId || data.mpesaReceipt), {
    message: "Provide checkoutId or mpesaReceipt.",
  });

export const depositPaymentSchema = z.object({
  method: z.enum(["stk", "mpesa_code"]),
  status: z.enum(["pending", "verified", "failed"]),
  verifiedAt: z.string().nullable().optional(),
  mpesaReceipt: z.string().nullable().optional(),
});

export const depositValidateStatusSchema = z.enum([
  "verified",
  "failed",
  "pending",
]);

export const depositValidateResponseSchema = z.object({
  status: depositValidateStatusSchema,
  mpesaReceipt: z.string().nullable().optional(),
  depositPayment: depositPaymentSchema.nullable().optional(),
  applicationVersion: z.number().int().positive().optional(),
});

export type DepositStkResponse = z.infer<typeof depositStkResponseSchema>;
export type DepositValidateResponse = z.infer<
  typeof depositValidateResponseSchema
>;
