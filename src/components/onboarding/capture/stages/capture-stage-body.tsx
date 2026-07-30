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
import { IdOcrPanel } from "@/components/onboarding/capture/id-ocr-panel";
import { FaceMatchPanel } from "@/components/onboarding/capture/face-match-panel";
import { ProtoBtn, ProtoField, ProtoInput } from "@/components/onboarding/atoms/proto-field";
import { Button } from "@/components/ui/button";

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
    async function runLookupSearch() {
      setLookupMessage(null);
      setLookupMatches([]);
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
        setLookupMessage("No portal matches — use new customer below.");
      } else {
        setLookupMessage(`${result.matches.length} match(es) found.`);
      }
    }

    return (
      <div className="mt-4 space-y-4">
        <ProtoField label="Phone number or National ID">
          <ProtoInput
            placeholder="Search phone or National ID"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
          />
        </ProtoField>
        <ProtoBtn ghost small onClick={() => void runLookupSearch()}>
          Search portal
        </ProtoBtn>
        {lookupMessage ? (
          <p className="text-sm text-ink-soft">{lookupMessage}</p>
        ) : null}
        {lookupMatches.map((match) => (
          <button
            key={match.leadId}
            type="button"
            className={`jw-tap w-full rounded-2xl border p-4 text-left ${
              form.selectedLeadId === match.leadId
                ? "border-accent bg-accent/5"
                : "border-line bg-card"
            }`}
            onClick={() =>
              patchForm({
                customerFound: "portal",
                name: match.displayName,
                selectedLeadId: match.leadId,
                selectedLeadSource: match.source,
              })
            }
          >
            <p className="font-bold text-ink">{match.displayName}</p>
            <p className="text-sm text-ink-soft">{match.phoneMasked}</p>
            {match.nationalIdMasked ? (
              <p className="text-xs text-ink-faint">{match.nationalIdMasked}</p>
            ) : null}
          </button>
        ))}
        <ProtoBtn
          ghost
          onClick={() =>
            patchForm({
              customerFound: "new",
              selectedLeadId: null,
              selectedLeadSource: "WALK_IN",
            })
          }
        >
          New customer (no portal record)
        </ProtoBtn>
        {form.customerFound ? (
          <p className="text-sm font-bold text-accent-deep">
            Selected: {form.customerFound === "portal" ? form.name : "New"}
          </p>
        ) : null}
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
    return (
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ProtoField label="Full name" required>
          <ValidatedTextInput
            value={form.name}
            showValidation={showValidation}
            validate={(v) => (v.trim() ? null : "Full name is required.")}
            onChange={(name) => patchForm({ name })}
          />
        </ProtoField>
        <ProtoField label="Phone" required>
          <KenyaPhoneInput
            value={form.phone}
            showValidation={showValidation}
            onChange={(phone) => patchForm({ phone })}
          />
        </ProtoField>
        <ProtoField label="National ID" required>
          <ValidatedTextInput
            value={form.idNo}
            showValidation={showValidation}
            validate={(v) => nationalIdFormatErrorMessage(v)}
            onChange={(idNo) => patchForm({ idNo })}
          />
        </ProtoField>
        <ProtoField label="Gender" required>
          <select
            className="jw-focus w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3"
            value={form.gender}
            onChange={(e) => patchForm({ gender: e.target.value })}
          >
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
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
        <ProtoField label="Email">
          <ValidatedTextInput
            value={form.email}
            showValidation={showValidation}
            validate={(v) => {
              if (!v.trim()) return null;
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
                ? null
                : "Enter a valid email address.";
            }}
            onChange={(email) => patchForm({ email })}
          />
        </ProtoField>
        <ProtoField label="County" required>
          <ValidatedTextInput
            value={form.county}
            showValidation={showValidation}
            validate={(v) => (v.trim() ? null : "County is required.")}
            onChange={(county) => patchForm({ county })}
          />
        </ProtoField>
        <ProtoField label="Sub-county">
          <ProtoInput
            value={form.subCounty}
            onChange={(e) => patchForm({ subCounty: e.target.value })}
          />
        </ProtoField>
        <ProtoField label="Area / estate">
          <ProtoInput
            value={form.area}
            onChange={(e) => patchForm({ area: e.target.value })}
          />
        </ProtoField>
        <ProtoField label="Landmark">
          <ProtoInput
            value={form.landmark}
            onChange={(e) => patchForm({ landmark: e.target.value })}
          />
        </ProtoField>
        <ProtoField label="KRA PIN" required>
          <ValidatedTextInput
            value={form.kraPin}
            showValidation={showValidation}
            validate={(v) => kraPinFormatErrorMessage(v)}
            onChange={(kraPin) => patchForm({ kraPin: kraPin.toUpperCase() })}
          />
        </ProtoField>
        {docSlot("id_front", "National ID (front)", {
          required: true,
          preferCamera: true,
        })}
        {docSlot("id_back", "National ID (back)", {
          required: true,
          preferCamera: true,
        })}
        {docSlot("kra_certificate", "KRA PIN certificate", { required: true })}
        {docSlot("selfie", "Client photo", {
          required: true,
          preferCamera: true,
        })}
        <div className="md:col-span-2">
          <IdOcrPanel
            onApplied={(fields) =>
              patchForm({ name: fields.name, idNo: fields.idNo })
            }
          />
          <FaceMatchPanel />
        </div>
      </div>
    );
  }

  if (stage === "dl") {
    return (
      <div className="mt-4 space-y-3">
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
      </div>
    );
  }

  if (stage === "cogc") {
    return (
      <div className="mt-4 space-y-3">
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
      </div>
    );
  }

  if (stage === "references") {
    return (
      <div className="mt-4 space-y-4">
        {form.references.map((ref, index) => (
          <div key={index} className="rounded-2xl border border-line p-4">
            <p className="text-xs font-bold text-ink-faint">
              Reference {index + 1}
            </p>
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
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ref.called}
                onChange={(e) => {
                  const references = [...form.references];
                  references[index] = { ...ref, called: e.target.checked };
                  patchForm({ references });
                }}
              />
              Reference called during this session
            </label>
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.refConsent}
            onChange={(e) => patchForm({ refConsent: e.target.checked })}
          />
          Customer consents to reference verification calls
        </label>
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
      <div className="mt-4 space-y-4">
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
        {form.quoteDailyKes != null ? (
          <div className="rounded-xl border border-line bg-card-deep p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-faint">
              Financing calculator
            </p>
            <p className="mt-2 text-sm font-bold text-accent-deep">
              Daily installment: KES {form.quoteDailyKes.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Based on {form.term} months · {form.opModel || "operating model"}{" "}
              · deposit KES {form.deposit.toLocaleString()} (server quote)
            </p>
          </div>
        ) : null}
        <ProductDepositStkPanel
          form={form}
          referenceCode={referenceCode}
          showValidation={showValidation}
          fieldError={fieldErrors.stkVerified}
          patchForm={patchForm}
          syncFromResource={syncFromResource}
        />
      </div>
    );
  }

  if (stage === "bike") {
    return (
      <div className="mt-4 grid gap-2">
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
      </div>
    );
  }

  if (stage === "review") {
    const checklist = reviewChecklistItems(form, referenceCode);
    const blocking = reviewBlockingSummary(form);

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-card p-5 text-sm">
          <p>
            <strong>{form.name || "Customer"}</strong> ·{" "}
            {form.opModel || "Model TBD"}
          </p>
          <p className="mt-2">Bike: {form.bikeReg ?? "—"}</p>
          <p className="mt-2">Deposit: KES {form.deposit.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-faint">
            Stage checklist
          </p>
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
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={AppRoutes.desk}>Return to desk</Link>
        </Button>
      </div>
    );
  }

  return null;
}
