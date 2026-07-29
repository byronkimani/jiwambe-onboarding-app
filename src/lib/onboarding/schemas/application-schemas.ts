import { z } from "zod";
import { kenyaMsisdnWireSchema } from "@/lib/global/auth/normalize-phone";
import { normalizeNationalIdDigits } from "@/lib/onboarding/validation/national-id";

const lifecycleStateSchema = z.enum([
  "DRAFT",
  "PAUSED",
  "OPS_REVIEW",
  "LMS_CREATED",
  "AGREEMENT_SIGNED",
  "READY_FOR_RELEASE",
  "ACTIVE_LOAN",
  "DISQUALIFIED",
]);

const documentStatusSchema = z.enum([
  "uploading",
  "ready",
  "failed",
  "rejected",
]);

const onboardingDocumentSchema = z.object({
  documentId: z.string().min(1),
  url: z.string().min(1),
  contentType: z.string().optional(),
  fileName: z.string().optional(),
  byteSize: z.number().optional(),
  uploadedAt: z.string().optional(),
  status: documentStatusSchema.optional(),
});

export const readinessAttestationsSchema = z.object({
  hasId: z.literal(true),
  knowsKra: z.literal(true),
  dlKnown: z.literal(true),
  cogcKnown: z.literal(true),
  hasFunds: z.literal(true),
  refsBriefed: z.literal(true),
  attestedAt: z.string().optional(),
});

export const createApplicationRequestSchema = z.object({
  readinessAttestations: readinessAttestationsSchema,
});

const applicationAssignmentSchema = z.object({
  officerId: z.string().min(1),
  officerDisplayName: z.string().min(1),
  dealershipId: z.string().min(1),
  dealershipName: z.string().min(1),
});

const applicationPauseSchema = z.object({
  reason: z.string().min(1),
  pausedAt: z.string().min(1),
  pausedByOfficerId: z.string().min(1),
});

const customerAddressSchema = z.object({
  county: z.string().min(1),
  subCounty: z.string().optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
});

const applicationCustomerSchema = z.object({
  legalName: z.string().optional(),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  kraPin: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  email: z.string().optional(),
  address: customerAddressSchema.optional(),
  idFront: onboardingDocumentSchema.nullable().optional(),
  idBack: onboardingDocumentSchema.nullable().optional(),
  kraCertificate: onboardingDocumentSchema.nullable().optional(),
  selfie: onboardingDocumentSchema.nullable().optional(),
  faceMatchScore: z.number().nullable().optional(),
  faceMatchPassed: z.boolean().nullable().optional(),
  idOcrStatus: z.string().nullable().optional(),
});

const applicationDrivingLicenceSchema = z.object({
  licenceNumber: z.string().optional(),
  licenceClass: z.string().optional(),
  expiryDate: z.string().optional(),
  isProvisional: z.boolean().optional(),
  front: onboardingDocumentSchema.nullable().optional(),
  back: onboardingDocumentSchema.nullable().optional(),
  pelezaReport: onboardingDocumentSchema.nullable().optional(),
});

const applicationGoodConductSchema = z.object({
  certificate: onboardingDocumentSchema.nullable().optional(),
  pelezaReport: onboardingDocumentSchema.nullable().optional(),
  issuedOn: z.string().optional(),
  expiresOn: z.string().optional(),
});

const referenceEntrySchema = z.object({
  name: z.string().min(1),
  nationalId: z.string().optional(),
  phone: z.string().min(1),
  relationship: z.string().min(1),
  called: z.boolean().optional(),
  callOutcome: z.string().optional(),
});

const applicationReferencesSchema = z.object({
  customerConsent: z.boolean(),
  entries: z.array(referenceEntrySchema),
  nextOfKin: z
    .object({
      name: z.string().min(1),
      phone: z.string().min(1),
      relationship: z.string().min(1),
    })
    .nullable()
    .optional(),
});

const operatingModelTypeSchema = z.enum([
  "FLEET",
  "STAGE",
  "DELIVERY",
  "PERSONAL",
]);

const applicationOperatingModelSchema = z.object({
  type: operatingModelTypeSchema,
  fleet: z.object({ boltDriverActive: z.boolean() }).nullable().optional(),
  stage: z.record(z.string(), z.unknown()).nullable().optional(),
  delivery: z.record(z.string(), z.unknown()).nullable().optional(),
  personal: z.record(z.string(), z.unknown()).nullable().optional(),
});

const depositPaymentSchema = z.object({
  method: z.enum(["stk", "mpesa_code"]),
  status: z.enum(["pending", "verified", "failed"]),
  verifiedAt: z.string().nullable().optional(),
  mpesaReceipt: z.string().nullable().optional(),
});

const applicationFinancingSchema = z.object({
  productId: z.string().optional(),
  productLabel: z.string().optional(),
  assetCondition: z.enum(["new", "used"]).optional(),
  termMonths: z.number().optional(),
  depositKes: z.number().optional(),
  dailyAmountKes: z.number().optional(),
  minDepositKes: z.number().optional(),
  financedAmountKes: z.number().optional(),
  quoteUpdatedAt: z.string().optional(),
  depositPayment: depositPaymentSchema.nullable().optional(),
});

const applicationBikeAssignmentSchema = z.object({
  inventoryItemId: z.string().optional(),
  registration: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  insuranceSticker: z.string().nullable().optional(),
  stickerExpiry: z.string().nullable().optional(),
  holdAvailableUntil: z.string().nullable().optional(),
});

const applicationSubmissionSchema = z.object({
  submittedAt: z.string().nullable().optional(),
  officerAttestation: z.boolean().optional(),
});

const applicationOperationsSchema = z.object({
  lmsId: z.string().nullable().optional(),
  opsNote: z.string().nullable().optional(),
  flag: z.string().nullable().optional(),
});

const applicationTimestampsSchema = z.object({
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const onboardingApplicationResourceSchema = z.object({
  id: z.string().min(1),
  referenceCode: z.string().min(1),
  version: z.number().int().positive(),
  lifecycleState: lifecycleStateSchema,
  pause: applicationPauseSchema.nullable(),
  leadId: z.string().nullable().optional(),
  leadSource: z.string().nullable().optional(),
  assignment: applicationAssignmentSchema,
  readinessAttestations: readinessAttestationsSchema.nullable().optional(),
  customer: applicationCustomerSchema.nullable().optional(),
  drivingLicence: applicationDrivingLicenceSchema.nullable().optional(),
  goodConduct: applicationGoodConductSchema.nullable().optional(),
  references: applicationReferencesSchema.nullable().optional(),
  operatingModel: applicationOperatingModelSchema.nullable().optional(),
  financing: applicationFinancingSchema.nullable().optional(),
  bikeAssignment: applicationBikeAssignmentSchema.nullable().optional(),
  submission: applicationSubmissionSchema,
  operations: applicationOperationsSchema,
  timestamps: applicationTimestampsSchema,
});

export const onboardingApplicationSummarySchema = z.object({
  id: z.string().min(1),
  referenceCode: z.string().min(1),
  lifecycleState: lifecycleStateSchema,
  customerDisplayName: z.string().nullable().optional(),
  phoneMasked: z.string().nullable().optional(),
  operatingModel: z.string().nullable().optional(),
  productLabel: z.string().nullable().optional(),
  depositKes: z.number().nullable().optional(),
  dailyAmountKes: z.number().nullable().optional(),
  bikeRegistration: z.string().nullable().optional(),
  flag: z.string().nullable().optional(),
  updatedAt: z.string().min(1),
  officerDisplayName: z.string().nullable().optional(),
  dealershipName: z.string().nullable().optional(),
  termMonths: z.number().nullable().optional(),
  lmsId: z.string().nullable().optional(),
  financedAmountKes: z.number().nullable().optional(),
  nationalIdMasked: z.string().nullable().optional(),
});

export const applicationListResponseSchema = z.object({
  applications: z.array(onboardingApplicationSummarySchema),
});

export const applicationResourceResponseSchema = z.object({
  application: onboardingApplicationResourceSchema,
});

const patchReadinessSchema = z.object({
  hasId: z.boolean().optional(),
  knowsKra: z.boolean().optional(),
  dlKnown: z.boolean().optional(),
  cogcKnown: z.boolean().optional(),
  hasFunds: z.boolean().optional(),
  refsBriefed: z.boolean().optional(),
  attestedAt: z.string().optional(),
});

export const patchApplicationRequestSchema = z
  .object({
    version: z.number().int().positive(),
    pause: applicationPauseSchema.nullable().optional(),
    leadId: z.string().nullable().optional(),
    leadSource: z.string().nullable().optional(),
    readinessAttestations: patchReadinessSchema.nullable().optional(),
    customer: applicationCustomerSchema.nullable().optional(),
    drivingLicence: applicationDrivingLicenceSchema.nullable().optional(),
    goodConduct: applicationGoodConductSchema.nullable().optional(),
    references: applicationReferencesSchema.nullable().optional(),
    operatingModel: applicationOperatingModelSchema.nullable().optional(),
    financing: applicationFinancingSchema.nullable().optional(),
    bikeAssignment: applicationBikeAssignmentSchema.nullable().optional(),
    submission: applicationSubmissionSchema.optional(),
    operations: applicationOperationsSchema.optional(),
  })
  .strict();

export const pauseApplicationRequestSchema = z.object({
  reason: z.string().min(6),
});

export const disqualifyApplicationRequestSchema = z.object({
  reason: z.string().min(6),
});

export const submitApplicationRequestSchema = z
  .object({
    officerAttestation: z.literal(true).optional(),
  })
  .strict();

export const submitBlockingIssueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export const submitValidationErrorResponseSchema = z.object({
  error: z.literal("validation_failed"),
  blockingIssues: z.array(submitBlockingIssueSchema),
});

export const customerLookupRequestSchema = z
  .object({
    phone: z.string().optional(),
    nationalId: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      const hasPhone = Boolean(data.phone?.trim());
      const hasNid = Boolean(data.nationalId?.trim());
      return hasPhone || hasNid;
    },
    { message: "Provide phone or national ID." },
  );

export const customerLookupMatchSchema = z.object({
  leadId: z.string().min(1),
  source: z.string().min(1),
  displayName: z.string().min(1),
  phoneMasked: z.string().min(1),
  nationalIdMasked: z.string().nullable().optional(),
});

export const customerLookupResponseSchema = z.object({
  matches: z.array(customerLookupMatchSchema),
});

export function normalizeCustomerLookupRequest(
  body: z.infer<typeof customerLookupRequestSchema>,
):
  | { ok: true; phone?: string; nationalId?: string }
  | { ok: false; message: string } {
  let phone: string | undefined;
  if (body.phone?.trim()) {
    const digits = body.phone.replace(/\D/g, "");
    const wire = digits.startsWith("254")
      ? digits
      : digits.startsWith("0")
        ? `254${digits.slice(1)}`
        : `254${digits}`;
    const parsed = kenyaMsisdnWireSchema.safeParse(wire);
    if (!parsed.success) {
      return { ok: false, message: "Invalid phone number." };
    }
    phone = parsed.data;
  }

  let nationalId: string | undefined;
  if (body.nationalId?.trim()) {
    const digits = normalizeNationalIdDigits(body.nationalId);
    if (digits.length < 5 || digits.length > 9) {
      return { ok: false, message: "Invalid national ID." };
    }
    nationalId = digits;
  }

  return { ok: true, phone, nationalId };
}
