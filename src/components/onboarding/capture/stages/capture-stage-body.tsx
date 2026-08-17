"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { ReadinessStageBody } from "@/components/onboarding/capture/stages/readiness-stage-body";
import { ModelStageBody } from "@/components/onboarding/capture/stages/model-stage-body";
import { ExitCard } from "@/components/onboarding/capture/exit-card";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { validateCaptureStage } from "@/lib/onboarding/capture/stage-validation";
import { useInventory } from "@/lib/onboarding/use-inventory";
import { useCatalogProducts } from "@/lib/onboarding/use-catalog-products";
import { useCatalogQuote } from "@/lib/onboarding/use-catalog-quote";
import { CaptureInlineError } from "@/components/onboarding/capture/capture-inline-error";
import { ProductDepositStkPanel } from "@/components/onboarding/capture/product-deposit-stk-panel";
import { useCaptureWizard } from "@/components/onboarding/capture/capture-wizard-context";
import { KenyaPhoneInput } from "@/components/onboarding/atoms/kenya-phone-input";
import { ValidatedTextInput } from "@/components/onboarding/atoms/validated-text-input";
import { nationalIdFormatErrorMessage } from "@/lib/onboarding/validation/national-id";
import { apiCustomerLookup } from "@/lib/onboarding/capture/application-api";
import { normalizeNationalIdDigits } from "@/lib/onboarding/validation/national-id";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
import { DocumentSlot } from "@/components/onboarding/atoms/document-slot";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";
import { kraPinFormatErrorMessage } from "@/lib/onboarding/capture/capture-document-requirements";
import { REFERENCE_RELATIONSHIP_OPTIONS } from "@/lib/onboarding/capture/reference-options";
import {
  reviewChecklistItems,
  reviewBlockingSummary,
} from "@/lib/onboarding/capture/review-checklist";
import type { CustomerLookupMatch } from "@/lib/onboarding/application-resource";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CAPTURE_DOCUMENT_FORM_KEYS } from "@/lib/onboarding/capture/capture-form-documents";
// import { IdOcrPanel } from "@/components/onboarding/capture/id-ocr-panel";
// import { FaceMatchPanel } from "@/components/onboarding/capture/face-match-panel";
import { ProtoBtn, ProtoField, ProtoInput, ProtoSelect } from "@/components/onboarding/atoms/proto-field";
import { ProtoChoiceRow } from "@/components/onboarding/atoms/proto-choice-row";
import { ProtoCheckbox } from "@/components/onboarding/atoms/proto-checkbox";
import { SectionCard } from "@/components/onboarding/atoms/section-card";
import { ProtoTag } from "@/components/onboarding/atoms/proto-tag";
import { captureStagePath } from "@/lib/onboarding/capture/nav";
import {
  KENYA_COUNTIES,
  KENYA_COUNTY_NAMES,
} from "@/lib/onboarding/capture/kenya-counties";

export type CaptureStageBodyProps = {
  stage: CaptureStageKey;
  form: CaptureFormState;
  showValidation?: boolean;
};

export function CaptureStageBody({
  stage,
  form,
  showValidation = false,
}: CaptureStageBodyProps) {
  const {
    patchForm,
    referenceCode,
    syncFromResource,
    documentUploads,
    captureDocument,
    retryDocumentUpload,
    clearDocumentSlot,
    pauseApplication,
    patchApplicationForStage,
    patching,
  } = useCaptureWizard();
  const router = useRouter();
  const {
    items: inventoryItems,
    rules: inventoryRules,
    loading: inventoryLoading,
    error: inventoryError,
  } = useInventory();
  const {
    products: catalogProducts,
    loading: catalogLoading,
    error: catalogError,
  } = useCatalogProducts();
  const productQuote = useCatalogQuote({
    productId: stage === "product" ? form.productId : "",
    depositKes: stage === "product" ? form.deposit : 0,
    termMonths: stage === "product" ? Number(form.term) || 18 : 18,
    operatingModel: stage === "product" ? form.opModel : "",
    assetCondition: form.assetType === "used" ? "used" : "new",
    enabled: stage === "product",
  });
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [lookupMatches, setLookupMatches] = useState<CustomerLookupMatch[]>([]);
  const [lookupResult, setLookupResult] = useState<"found" | "none" | null>(
    null,
  );

  useEffect(() => {
    if (stage !== "product") return;
    const q = productQuote.quote;
    patchForm({
      quoteMinDepositKes: q?.minDepositKes ?? null,
      quoteDailyKes: q?.dailyAmountKes ?? null,
    });
  }, [stage, productQuote.quote, patchForm]);

  const stageValidation = showValidation
    ? validateCaptureStage(stage, form)
    : { ok: true as const };
  const fieldErrors =
    stageValidation.ok === false ? stageValidation.fieldErrors : {};

  function docSlot(
    purpose: DocumentPurpose,
    label: string,
    options?: { required?: boolean; preferCamera?: boolean },
  ) {
    const keys = CAPTURE_DOCUMENT_FORM_KEYS[purpose];
    if (!keys) return null;
    const preview = form[keys.preview] as string | null;

    return (
      <DocumentSlot
        key={purpose}
        label={label}
        required={options?.required}
        preferCamera={options?.preferCamera}
        image={preview}
        showValidation={showValidation}
        validationMessage={fieldErrors[String(keys.preview)]}
        uploading={documentUploads[purpose].status === "uploading"}
        uploadError={documentUploads[purpose].error}
        captureDisabled={!referenceCode}
        onCapture={(file) => captureDocument(purpose, file)}
        onRetry={() => retryDocumentUpload(purpose)}
        onRetake={() => clearDocumentSlot(purpose)}
      />
    );
  }

  async function pauseFromStage(reason: string) {
    const ok = await pauseApplication(stage, reason);
    if (!ok) {
      toast.error("Could not pause application.");
      return;
    }
    toast.success("Application paused — saved to drafts.");
    router.push(AppRoutes.deskDrafts);
  }

  if (stage === "lookup") {
    const primaryMatch = lookupMatches[0] ?? null;

    async function runLookupSearch() {
      setLookupMessage(null);
      setLookupMatches([]);
      setLookupResult(null);
      const digits = normalizeNationalIdDigits(lookupQuery);
      const phoneParsed = parseKenyaPhoneForSubmit(lookupQuery);
      const body =
        phoneParsed.ok
          ? { phone: lookupQuery }
          : digits.length >= 5
            ? { nationalId: digits }
            : null;
      if (!body) {
        setLookupMessage("Enter a valid phone or National ID to search.");
        return;
      }
      const result = await apiCustomerLookup(body);
      if (!result.ok) {
        setLookupMessage(result.message);
        return;
      }
      setLookupMatches(result.matches);
      if (result.matches.length === 0) {
        setLookupResult("none");
      } else {
        setLookupResult("found");
      }
    }

    async function continueWithApplicant(match: CustomerLookupMatch) {
      patchForm({
        customerFound: "portal",
        name: match.displayName,
        phone: match.phone ?? match.phoneMasked,
        idNo: match.nationalId ?? match.nationalIdMasked ?? "",
        county: match.county ?? form.county,
        selectedLeadId: match.leadId,
        selectedLeadSource: match.source,
      });
      if (referenceCode) {
        const saved = await patchApplicationForStage("lookup");
        if (!saved.ok) {
          toast.error("Could not save lookup selection.");
          return;
        }
      }
      router.push(captureStagePath("identity", referenceCode ?? undefined));
    }

    async function startFreshApplication() {
      patchForm({
        customerFound: "new",
        selectedLeadId: null,
        selectedLeadSource: "WALK_IN",
      });
      if (referenceCode) {
        const saved = await patchApplicationForStage("lookup");
        if (!saved.ok) {
          toast.error("Could not save new customer selection.");
          return;
        }
      }
      router.push(captureStagePath("identity", referenceCode ?? undefined));
    }

    return (
      <div className="mt-4">
        <ProtoField label="Phone number or National ID">
          <div className="flex gap-2.5">
            <ProtoInput
              className="flex-1"
              placeholder="07XX XXX XXX or ID number"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
            />
            <ProtoBtn
              className="w-[120px] shrink-0"
              onClick={() => void runLookupSearch()}
            >
              Search
            </ProtoBtn>
          </div>
        </ProtoField>
        {lookupMessage ? (
          <p className="mb-2 text-sm text-ink-soft">{lookupMessage}</p>
        ) : null}
        {lookupResult === "found" && primaryMatch ? (
          <div className="animate-fade-up mt-2 rounded-[14px] border-[1.5px] border-blue/20 bg-blue-bg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold text-ink">
                  {primaryMatch.displayName}
                </p>
                <p className="mt-0.5 text-[12.5px] text-ink-soft">
                  Started application on self-service portal
                  {primaryMatch.portalStartedLabel
                    ? ` · ${primaryMatch.portalStartedLabel}`
                    : ""}
                </p>
                <p className="mt-1 text-[12.5px] font-semibold text-ink">
                  {primaryMatch.phone ?? primaryMatch.phoneMasked}
                  {primaryMatch.nationalId || primaryMatch.nationalIdMasked
                    ? ` · ID ${primaryMatch.nationalId ?? primaryMatch.nationalIdMasked}`
                    : ""}
                </p>
              </div>
              <ProtoTag tone="info">Portal draft</ProtoTag>
            </div>
            <p className="mt-3 rounded-[10px] bg-white px-3 py-2.5 text-[12.5px] font-semibold leading-relaxed text-blue">
              ⚠️ Confirm every field against their ID and DL in person — treat
              portal data as unverified until you check it.
            </p>
            <ProtoBtn
              small
              className="mt-3"
              disabled={patching}
              onClick={() => void continueWithApplicant(primaryMatch)}
            >
              Continue with this applicant →
            </ProtoBtn>
          </div>
        ) : null}
        {lookupResult === "none" ? (
          <div className="animate-fade-up mt-2 rounded-[14px] bg-slate-bg p-4 text-[13.5px] text-ink-soft">
            No existing record found. Start a fresh application below.
          </div>
        ) : null}
        <div className="mt-6 border-t border-line pt-5">
          <ProtoBtn
            ghost
            className="w-full"
            disabled={patching}
            onClick={() => void startFreshApplication()}
          >
            + Start a new application from scratch
          </ProtoBtn>
        </div>
        <CaptureInlineError
          show={showValidation}
          message={fieldErrors.customerFound}
        />
      </div>
    );
  }

  if (stage === "readiness") {
    return (
      <ReadinessStageBody
        form={form}
        patchForm={patchForm}
        showValidation={showValidation}
      />
    );
  }

  if (stage === "identity") {
    const subCountyOptions = (KENYA_COUNTIES[form.county] ?? []).map((name) => ({
      value: name,
      label: name,
    }));

    return (
      <div className="mt-4">
        <SectionCard title="Personal details">
          <ProtoField label="Full name (as on National ID)" required id="identity-name">
            <ValidatedTextInput
              id="identity-name"
              value={form.name}
              showValidation={showValidation}
              validate={(v) => (v.trim() ? null : "Full name is required.")}
              onChange={(name) => patchForm({ name })}
            />
          </ProtoField>
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-4">
            <ProtoField label="Gender" required>
              <ProtoChoiceRow
                value={form.gender}
                onChange={(gender) => patchForm({ gender })}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
              />
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.gender}
              />
            </ProtoField>
            <ProtoField label="Date of birth" required>
              <ProtoInput
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => patchForm({ dateOfBirth: e.target.value })}
              />
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.dateOfBirth}
              />
            </ProtoField>
          </div>
        </SectionCard>

        <SectionCard title="Contact">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-4">
            <ProtoField label="Phone number" required hint="STK push target." id="identity-phone">
              <KenyaPhoneInput
                id="identity-phone"
                value={form.phone}
                showValidation={showValidation}
                onChange={(phone) => patchForm({ phone })}
              />
            </ProtoField>
            <ProtoField label="Email address" required id="identity-email">
              <ValidatedTextInput
                id="identity-email"
                value={form.email}
                showValidation={showValidation}
                validate={(v) => {
                  if (!v.trim()) return "Email is required.";
                  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
                    ? null
                    : "Enter a valid email address.";
                }}
                onChange={(email) => patchForm({ email })}
              />
            </ProtoField>
          </div>
        </SectionCard>

        <SectionCard title="Where they live">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-4">
            <ProtoField label="County" required id="identity-county">
              <ProtoSelect
                id="identity-county"
                value={form.county}
                onChange={(county) => patchForm({ county, subCounty: "" })}
                placeholder="Select county…"
                options={KENYA_COUNTY_NAMES.map((name) => ({
                  value: name,
                  label: name,
                }))}
              />
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.county}
              />
            </ProtoField>
            <ProtoField
              label="Sub-county"
              required
              id="identity-subcounty"
              hint={!form.county ? "Choose a county first." : undefined}
            >
              <ProtoSelect
                id="identity-subcounty"
                value={form.subCounty}
                onChange={(subCounty) => patchForm({ subCounty })}
                placeholder={form.county ? "Select sub-county…" : "—"}
                options={subCountyOptions}
              />
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.subCounty}
              />
            </ProtoField>
            <ProtoField label="Area" required id="identity-area">
              <ProtoInput
                id="identity-area"
                value={form.area}
                onChange={(e) => patchForm({ area: e.target.value })}
              />
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.area}
              />
            </ProtoField>
            <ProtoField label="Nearest landmark" required id="identity-landmark">
              <ProtoInput
                id="identity-landmark"
                value={form.landmark}
                onChange={(e) => patchForm({ landmark: e.target.value })}
              />
              <CaptureInlineError
                show={showValidation}
                message={fieldErrors.landmark}
              />
            </ProtoField>
          </div>
        </SectionCard>

        <SectionCard
          title="National ID"
          hint="Capture both sides. The number below must match the card exactly."
        >
          <ProtoField label="National ID number" required id="identity-nid">
            <ValidatedTextInput
              id="identity-nid"
              value={form.idNo}
              showValidation={showValidation}
              validate={(v) => nationalIdFormatErrorMessage(v)}
              onChange={(idNo) => patchForm({ idNo })}
            />
          </ProtoField>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {docSlot("id_front", "ID — front", {
              required: true,
              preferCamera: true,
            })}
            {docSlot("id_back", "ID — back", {
              required: true,
              preferCamera: true,
            })}
          </div>
          {/* OCR demo UI disabled — see id-ocr-panel.tsx
          <IdOcrPanel
            onApplied={(fields) =>
              patchForm({ name: fields.name, idNo: fields.idNo })
            }
          />
          */}
        </SectionCard>

        <SectionCard
          title="KRA PIN"
          hint="Capture the certificate if the customer has it with them or on their phone."
        >
          <ProtoField label="KRA PIN" required hint="Format: A012345678Z" id="identity-kra">
            <ValidatedTextInput
              id="identity-kra"
              value={form.kraPin}
              showValidation={showValidation}
              validate={(v) => kraPinFormatErrorMessage(v)}
              onChange={(kraPin) => patchForm({ kraPin: kraPin.toUpperCase() })}
            />
          </ProtoField>
          {docSlot("kra_certificate", "KRA PIN certificate", { required: true })}
        </SectionCard>

        <SectionCard
          title="Client photo"
          hint="One capture — this doubles as the passport photo."
        >
          {docSlot("selfie", "Client photo", {
            required: true,
            preferCamera: true,
          })}
          {/* Face match demo UI disabled — see face-match-panel.tsx
          <FaceMatchPanel />
          */}
        </SectionCard>
      </div>
    );
  }

  if (stage === "dl") {
    return (
      <div className="mt-4">
        <SectionCard title="Driving licence">
        <ProtoField label="Driving licence situation" required>
          <select
            className="jw-focus w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3"
            value={form.dlSituation}
            onChange={(e) => patchForm({ dlSituation: e.target.value })}
          >
            <option value="">Select…</option>
            <option value="smart">Valid smart DL</option>
            <option value="pdl">PDL</option>
            <option value="processing">Expired / processing</option>
            <option value="none">None</option>
          </select>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.dlSituation}
          />
        </ProtoField>
        {form.dlSituation && form.dlSituation !== "none" ? (
          <ProtoField label="DL number" required>
            <ValidatedTextInput
              value={form.dlNumber}
              showValidation={showValidation}
              validate={(v) =>
                v.trim() ? null : "DL number is required."
              }
              onChange={(dlNumber) => patchForm({ dlNumber })}
            />
          </ProtoField>
        ) : null}
        {form.dlSituation === "smart" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {docSlot("dl_front", "Licence — front", {
              required: true,
              preferCamera: true,
            })}
            {docSlot("dl_back", "Licence — back", {
              required: true,
              preferCamera: true,
            })}
          </div>
        ) : null}
        {form.dlSituation === "pdl" ? (
          docSlot("pdl_document", "PDL document", {
            required: true,
            preferCamera: true,
          })
        ) : null}
        {form.dlSituation === "processing" ? (
          <div className="space-y-3">
            {docSlot("dl_front", "Licence — front", {
              required: true,
              preferCamera: true,
            })}
            {docSlot("dl_peleza_report", "Peleza report — driving licence", {
              required: true,
            })}
          </div>
        ) : null}
        {form.dlSituation === "none" ? (
          <div className="space-y-3">
            <ProtoField label="Needs driving-school sponsorship?" required>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "yes", label: "Yes — refer to driving school" },
                  { value: "no", label: "No sponsorship needed" },
                ].map((opt) => (
                  <ProtoBtn
                    key={opt.value}
                    ghost={form.needsSponsorship !== opt.value}
                    className={
                      form.needsSponsorship === opt.value
                        ? "bg-accent text-white"
                        : ""
                    }
                    onClick={() => patchForm({ needsSponsorship: opt.value })}
                  >
                    {opt.label}
                  </ProtoBtn>
                ))}
              </div>
            </ProtoField>
            {form.needsSponsorship === "yes" ? (
              <ProtoField label="Preferred driving school (optional)">
                <ProtoInput
                  value={form.preferredDrivingSchool}
                  onChange={(e) =>
                    patchForm({ preferredDrivingSchool: e.target.value })
                  }
                />
              </ProtoField>
            ) : null}
            <ExitCard
              title="No driving licence"
              body="Customer cannot continue without a licence. Save as paused and refer to driving-school sponsorship or revisit when they obtain a DL."
              steps={[
                "Explain Jiwambe driving-school referral options.",
                "Save draft — application moves to your paused list.",
              ]}
              actionLabel="Save draft & pause"
              loading={patching}
              onAction={() =>
                void pauseFromStage(
                  "DL blocked — customer has no driving licence.",
                )
              }
            />
          </div>
        ) : null}
        </SectionCard>
      </div>
    );
  }

  if (stage === "cogc") {
    return (
      <div className="mt-4">
        <SectionCard title="Certificate of Good Conduct">
        <ProtoField label="Certificate of Good Conduct" required>
          <select
            className="jw-focus w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3"
            value={form.cogcSituation}
            onChange={(e) => patchForm({ cogcSituation: e.target.value })}
          >
            <option value="">Select…</option>
            <option value="have">Has the certificate</option>
            <option value="fingerprints">Fingerprints taken — certificate pending</option>
            <option value="peleza">Peleza check completed / waiting</option>
            <option value="none">Not started</option>
          </select>
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.cogcSituation}
          />
        </ProtoField>
        {form.cogcSituation === "have"
          ? docSlot("cogc_certificate", "Certificate of Good Conduct", {
              required: true,
            })
          : null}
        {form.cogcSituation === "peleza"
          ? docSlot("cogc_peleza_report", "Peleza report — good conduct", {
              required: true,
            })
          : null}
        {form.cogcSituation === "fingerprints" ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink-soft">
            Fingerprints taken — certificate is pending. Application will be
            flagged COGC-pending for operations. No upload required; continue
            when ready.
          </div>
        ) : null}
        {form.cogcSituation === "none" ? (
          <ExitCard
            title="Good conduct not started"
            body="Advise the customer to apply at DCI. Save as paused until they obtain a certificate or complete fingerprinting."
            steps={[
              "Explain DCI Certificate of Good Conduct application steps.",
              "Save draft — revisit when situation changes.",
            ]}
            actionLabel="Save draft & pause"
            loading={patching}
            onAction={() =>
              void pauseFromStage(
                "COGC blocked — customer has not started good conduct process.",
              )
            }
          />
        ) : null}
        </SectionCard>
      </div>
    );
  }

  if (stage === "references") {
    return (
      <div className="mt-4">
        {form.references.map((ref, index) => (
          <SectionCard
            key={index}
            title={index === 0 ? "Next of kin" : `Reference ${index + 1}`}
            className={
              ref.called ? "border-accent bg-accent-soft" : undefined
            }
          >
            {index === 0 ? (
              <div className="mb-3 flex justify-end">
                <ProtoTag tone="info">Always next of kin</ProtoTag>
              </div>
            ) : null}
            <ProtoInput
              className="mt-2"
              placeholder="Name"
              value={ref.name}
              onChange={(e) => {
                const references = [...form.references];
                references[index] = { ...ref, name: e.target.value };
                patchForm({ references });
              }}
            />
            <CaptureInlineError
              show={showValidation}
              message={fieldErrors[`references.${index}.name`]}
            />
            <div className="mt-2">
              <ValidatedTextInput
                value={ref.nationalId}
                showValidation={showValidation}
                validate={(v) => nationalIdFormatErrorMessage(v)}
                onChange={(nationalId) => {
                  const references = [...form.references];
                  references[index] = { ...ref, nationalId };
                  patchForm({ references });
                }}
              />
            </div>
            <CaptureInlineError
              show={showValidation}
              message={fieldErrors[`references.${index}.nationalId`]}
            />
            <select
              className="jw-focus mt-2 w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3"
              value={ref.relationship}
              onChange={(e) => {
                const references = [...form.references];
                references[index] = { ...ref, relationship: e.target.value };
                patchForm({ references });
              }}
            >
              <option value="">Relationship…</option>
              {REFERENCE_RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <CaptureInlineError
              show={showValidation}
              message={fieldErrors[`references.${index}.relationship`]}
            />
            <div className="mt-2">
              <KenyaPhoneInput
                value={ref.phone ?? ""}
                showValidation={showValidation}
                onChange={(phone) => {
                  const references = [...form.references];
                  references[index] = { ...ref, phone };
                  patchForm({ references });
                }}
              />
            </div>
            <CaptureInlineError
              show={showValidation}
              message={fieldErrors[`references.${index}.phone`]}
            />
            <ProtoCheckbox
              className="mt-2"
              checked={ref.called}
              onChange={(called) => {
                const references = [...form.references];
                references[index] = { ...ref, called };
                patchForm({ references });
              }}
              label="Called during this session"
            />
            <CaptureInlineError
              show={showValidation}
              message={fieldErrors[`references.${index}.called`]}
            />
          </SectionCard>
        ))}
        <ProtoCheckbox
          checked={form.refConsent}
          onChange={(refConsent) => patchForm({ refConsent })}
          label="Customer consents to reference verification calls"
        />
        <CaptureInlineError
          show={showValidation}
          message={fieldErrors.refConsent}
        />
      </div>
    );
  }

  if (stage === "model") {
    return (
      <ModelStageBody
        stage={stage}
        form={form}
        showValidation={showValidation}
        fieldErrors={fieldErrors}
        docSlot={docSlot}
      />
    );
  }

  if (stage === "product") {
    const minDeposit = form.quoteMinDepositKes;
    return (
      <div className="mt-4 space-y-0">
        <SectionCard title="Product selection">
        {catalogLoading ? (
          <p className="text-sm text-ink-soft">Loading products…</p>
        ) : null}
        {catalogError ? (
          <p className="text-sm font-semibold text-red-600">{catalogError}</p>
        ) : null}
        <div className="grid gap-2 md:grid-cols-3">
          {catalogProducts.map((product) => (
            <ProtoBtn
              key={product.id}
              ghost={form.productId !== product.id}
              className={
                form.productId === product.id ? "bg-accent text-white" : ""
              }
              onClick={() =>
                patchForm({
                  productId: product.id,
                  quoteMinDepositKes: null,
                  quoteDailyKes: null,
                })
              }
            >
              {product.label}
            </ProtoBtn>
          ))}
        </div>
        <CaptureInlineError
          show={showValidation}
          message={fieldErrors.productId}
        />
        </SectionCard>
        <SectionCard title="Financing term & deposit">
        <ProtoField label="Financing term" required>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "18", label: "18 months" },
              { value: "24", label: "24 months" },
            ].map((option) => (
              <ProtoBtn
                key={option.value}
                ghost={form.term !== option.value}
                className={
                  form.term === option.value ? "bg-accent text-white" : ""
                }
                onClick={() =>
                  patchForm({
                    term: option.value,
                    quoteMinDepositKes: null,
                    quoteDailyKes: null,
                  })
                }
              >
                {option.label}
              </ProtoBtn>
            ))}
          </div>
        </ProtoField>
        <ProtoField label="Deposit (KES)" required>
          <ProtoInput
            type="number"
            value={String(form.deposit)}
            onChange={(e) =>
              patchForm({
                deposit: Number(e.target.value) || 0,
                quoteMinDepositKes: null,
                quoteDailyKes: null,
              })
            }
          />
          <CaptureInlineError
            show={showValidation}
            message={fieldErrors.deposit}
          />
          {minDeposit != null && minDeposit > 0 ? (
            <p className="mt-1 text-xs text-ink-soft">
              Minimum for this quote: KES {minDeposit.toLocaleString()}
            </p>
          ) : productQuote.loading ? (
            <p className="mt-1 text-xs text-ink-soft">Loading quote…</p>
          ) : null}
          {productQuote.error ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {productQuote.error}
            </p>
          ) : null}
        </ProtoField>
        </SectionCard>
        {form.quoteDailyKes != null ? (
          <SectionCard title="Financing calculator">
            <p className="text-sm font-bold text-accent-deep">
              Daily installment: KES {form.quoteDailyKes.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Based on {form.term} months · {form.opModel || "operating model"}{" "}
              · deposit KES {form.deposit.toLocaleString()} (server quote)
            </p>
          </SectionCard>
        ) : null}
        <SectionCard title="Deposit verification">
        <ProductDepositStkPanel
          form={form}
          referenceCode={referenceCode}
          showValidation={showValidation}
          fieldError={fieldErrors.stkVerified}
          patchForm={patchForm}
          syncFromResource={syncFromResource}
        />
        </SectionCard>
      </div>
    );
  }

  if (stage === "bike") {
    return (
      <div className="mt-4">
        <SectionCard title="Dealership stock">
        {inventoryLoading ? (
          <p className="text-sm text-ink-soft">Loading dealership stock…</p>
        ) : null}
        {inventoryError ? (
          <p className="text-sm font-semibold text-red-600">{inventoryError}</p>
        ) : null}
        {inventoryItems.map((bike) => {
          const assignable = inventoryRules.assignableStatuses.includes(
            bike.status,
          );
          return (
            <button
              key={bike.registration}
              type="button"
              disabled={!assignable}
              className="jw-tap rounded-2xl border border-line bg-card p-4 text-left disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => patchForm({ bikeReg: bike.registration })}
            >
              <p className="font-bold">{bike.registration}</p>
              <p className="text-sm text-ink-soft">
                {bike.model} · {bike.color}
                {!assignable ? " · not assignable" : ""}
              </p>
            </button>
          );
        })}
        {form.bikeReg ? (
          <p className="text-sm font-bold text-accent-deep">
            Selected {form.bikeReg} — {inventoryRules.softHoldMinutes}m soft hold
          </p>
        ) : null}
        <CaptureInlineError
          show={showValidation}
          message={fieldErrors.bikeReg}
        />
        </SectionCard>
      </div>
    );
  }

  if (stage === "review") {
    const checklist = reviewChecklistItems(form, referenceCode);
    const blocking = reviewBlockingSummary(form);

    return (
      <div className="mt-4 space-y-0">
        <SectionCard title="Application summary">
          <p>
            <strong>{form.name || "Customer"}</strong> ·{" "}
            {form.opModel || "Model TBD"}
          </p>
          <p className="mt-2">Bike: {form.bikeReg ?? "—"}</p>
          <p className="mt-2">Deposit: KES {form.deposit.toLocaleString()}</p>
        </SectionCard>
        <SectionCard title="Stage checklist">
          <ul className="mt-3 space-y-2">
            {checklist.map((item) => (
              <li
                key={item.stage}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className={item.complete ? "text-ink" : "text-red-600"}>
                  {item.complete ? "✓" : "○"} {item.label}
                </span>
                {!item.complete && item.href ? (
                  <Link
                    href={item.href}
                    className="text-xs font-bold text-accent-deep"
                  >
                    Fix
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
          {blocking ? (
            <p className="mt-3 text-sm font-semibold text-red-600">{blocking}</p>
          ) : (
            <p className="mt-3 text-sm font-semibold text-accent-deep">
              All sections complete — ready to submit.
            </p>
          )}
        </SectionCard>
        <ProtoBtn ghost className="mt-4 w-full" onClick={() => router.push(AppRoutes.desk)}>
          Return to desk
        </ProtoBtn>
      </div>
    );
  }

  return null;
}
