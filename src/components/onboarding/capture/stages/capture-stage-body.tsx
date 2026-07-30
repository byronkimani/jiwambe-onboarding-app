"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { ReadinessStageBody } from "@/components/onboarding/capture/stages/readiness-stage-body";
import {
  PORTAL_CUSTOMERS,
} from "@/lib/onboarding/fixtures/capture-fixtures";
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
import { PhotoSlot } from "@/components/onboarding/atoms/photo-slot";
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
  const { patchForm, referenceCode, syncFromResource } = useCaptureWizard();
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
  const [scanning, setScanning] = useState(false);
  const [anomalies, setAnomalies] = useState<string[] | null>(null);

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

  const filteredPortal = PORTAL_CUSTOMERS.filter((c) => {
    const q = lookupQuery.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.idNo.includes(q)
    );
  });

  if (stage === "readiness") {
    return (
      <ReadinessStageBody
        form={form}
        patchForm={patchForm}
        showValidation={showValidation}
      />
    );
  }

  if (stage === "lookup") {
    async function runLookupSearch() {
      setLookupMessage(null);
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
      if (result.matches.length === 0) {
        setLookupMessage("No portal matches — use new customer below.");
      } else {
        setLookupMessage(`${result.matches.length} match(es) from API.`);
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
          Search portal (API)
        </ProtoBtn>
        {lookupMessage ? (
          <p className="text-sm text-ink-soft">{lookupMessage}</p>
        ) : null}
        {filteredPortal.map((customer) => (
          <button
            key={customer.idNo}
            type="button"
            className="jw-tap w-full rounded-2xl border border-line bg-card p-4 text-left"
            onClick={() =>
              patchForm({
                customerFound: "portal",
                name: customer.name,
                phone: customer.phone,
                idNo: customer.idNo,
                county: customer.county,
                selectedLeadId: `lead_${customer.idNo.replace(/\s/g, "")}`,
                selectedLeadSource: "PORTAL",
              })
            }
          >
            <p className="font-bold text-ink">{customer.name}</p>
            <p className="text-sm text-ink-soft">{customer.phone}</p>
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
        <ProtoField label="County" required>
          <ValidatedTextInput
            value={form.county}
            showValidation={showValidation}
            validate={(v) => (v.trim() ? null : "County is required.")}
            onChange={(county) => patchForm({ county })}
          />
        </ProtoField>
        <PhotoSlot
          label="National ID (front)"
          required
          image={form.idPhotoFront}
          showValidation={showValidation}
          onCapture={(url) => patchForm({ idPhotoFront: url })}
          onRetake={() => patchForm({ idPhotoFront: null })}
        />
        <PhotoSlot
          label="Customer selfie"
          required
          image={form.selfiePhoto}
          showValidation={showValidation}
          onCapture={(url) => patchForm({ selfiePhoto: url })}
          onRetake={() => patchForm({ selfiePhoto: null })}
        />
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
      </div>
    );
  }

  if (stage === "cogc") {
    return (
      <ProtoField label="Certificate of Good Conduct" required>
        <select
          className="jw-focus w-full rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-3"
          value={form.cogcSituation}
          onChange={(e) => patchForm({ cogcSituation: e.target.value })}
        >
          <option value="">Select…</option>
          <option value="have">Have certificate</option>
          <option value="fingerprints">Fingerprints taken</option>
          <option value="none">Not started</option>
        </select>
        <CaptureInlineError
          show={showValidation}
          message={fieldErrors.cogcSituation}
        />
      </ProtoField>
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
            <ProtoInput
              className="mt-2"
              placeholder="Relationship"
              value={ref.relationship}
              onChange={(e) => {
                const references = [...form.references];
                references[index] = { ...ref, relationship: e.target.value };
                patchForm({ references });
              }}
            />
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
      <div className="mt-4 space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          {["FLEET", "STAGE", "DELIVERY", "PERSONAL"].map((model) => (
            <ProtoBtn
              key={model}
              ghost={form.opModel !== model}
              className={form.opModel === model ? "bg-accent text-white" : ""}
              onClick={() => patchForm({ opModel: model })}
            >
              {model}
            </ProtoBtn>
          ))}
        </div>
        {form.opModel === "STAGE" ? (
          <p className="rounded-xl bg-card-deep p-3 text-sm text-ink-soft">
            Stage model: capture stage name, chairperson contact, and call
            outcome (prototype sub-flow).
          </p>
        ) : null}
        <CaptureInlineError
          show={showValidation}
          message={fieldErrors.opModel}
        />
      </div>
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
    return (
      <div className="rounded-2xl border border-line bg-card p-5 text-sm">
        <p>
          <strong>{form.name || "Customer"}</strong> · {form.opModel || "Model TBD"}
        </p>
        <p className="mt-2">Bike: {form.bikeReg ?? "—"}</p>
        <p className="mt-2">Deposit: KES {form.deposit.toLocaleString()}</p>
        <ProtoBtn
          className="mt-4"
          disabled={scanning}
          onClick={() => {
            setScanning(true);
            window.setTimeout(() => {
              setScanning(false);
              setAnomalies([]);
            }, 1000);
          }}
        >
          {scanning ? "Running pre-submit scan…" : "Run anomaly scan (demo)"}
        </ProtoBtn>
        {anomalies ? (
          <p className="mt-2 font-bold text-accent-deep">
            ✓ No anomalies flagged
          </p>
        ) : null}
        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href={AppRoutes.desk}>Return to desk</Link>
        </Button>
      </div>
    );
  }

  return null;
}
