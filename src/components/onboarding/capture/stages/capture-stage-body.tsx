"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { AppRoutes } from "@/lib/global/shared/routes";
import { ReadinessStageBody } from "@/components/onboarding/capture/stages/readiness-stage-body";
import {
  CATALOG_PRODUCTS,
  INVENTORY_BIKES,
  PORTAL_CUSTOMERS,
} from "@/lib/onboarding/fixtures/capture-fixtures";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { PhotoSlot } from "@/components/onboarding/atoms/photo-slot";
import { IdOcrPanel } from "@/components/onboarding/capture/id-ocr-panel";
import { FaceMatchPanel } from "@/components/onboarding/capture/face-match-panel";
import { ProtoBtn, ProtoField, ProtoInput } from "@/components/onboarding/atoms/proto-field";
import { Button } from "@/components/ui/button";

export type CaptureStageBodyProps = {
  stage: CaptureStageKey;
  form: CaptureFormState;
  patchForm: (patch: Partial<CaptureFormState>) => void;
};

export function CaptureStageBody({ stage, form, patchForm }: CaptureStageBodyProps) {
  const [quoteDaily, setQuoteDaily] = useState<number | null>(null);
  const [lookupQuery, setLookupQuery] = useState("");
  const [stkPending, setStkPending] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [anomalies, setAnomalies] = useState<string[] | null>(null);

  useEffect(() => {
    if (stage !== "product" || !form.productId) return;
    let cancelled = false;
    const url = `${AppRoutes.apiOnboardingCatalogQuotes}?productId=${encodeURIComponent(form.productId)}&deposit=${form.deposit}`;
    void fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body?.dailyInstallmentKes) {
          setQuoteDaily(body.dailyInstallmentKes as number);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [stage, form.productId, form.deposit]);

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
    return <ReadinessStageBody form={form} patchForm={patchForm} />;
  }

  if (stage === "lookup") {
    return (
      <div className="mt-4 space-y-4">
        <ProtoField label="Phone number or National ID">
          <ProtoInput
            placeholder="Search phone or National ID"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
          />
        </ProtoField>
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
              })
            }
          >
            <p className="font-bold text-ink">{customer.name}</p>
            <p className="text-sm text-ink-soft">{customer.phone}</p>
          </button>
        ))}
        <ProtoBtn ghost onClick={() => patchForm({ customerFound: "new" })}>
          New customer (no portal record)
        </ProtoBtn>
        {form.customerFound ? (
          <p className="text-sm font-bold text-accent-deep">
            Selected: {form.customerFound === "portal" ? form.name : "New"}
          </p>
        ) : null}
      </div>
    );
  }

  if (stage === "identity") {
    return (
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(
          [
            ["name", "Full name"],
            ["phone", "Phone"],
            ["idNo", "National ID"],
            ["county", "County"],
          ] as const
        ).map(([key, label]) => (
          <ProtoField key={key} label={label}>
            <ProtoInput
              value={form[key]}
              onChange={(e) => patchForm({ [key]: e.target.value })}
            />
          </ProtoField>
        ))}
        <PhotoSlot
          label="National ID (front)"
          required
          image={form.idPhotoFront}
          onCapture={(url) => patchForm({ idPhotoFront: url })}
          onRetake={() => patchForm({ idPhotoFront: null })}
        />
        <PhotoSlot
          label="Customer selfie"
          required
          image={form.selfiePhoto}
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
        <ProtoField label="Driving licence situation">
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
        </ProtoField>
        <ProtoInput
          placeholder="DL number"
          value={form.dlNumber}
          onChange={(e) => patchForm({ dlNumber: e.target.value })}
        />
      </div>
    );
  }

  if (stage === "cogc") {
    return (
      <ProtoField label="Certificate of Good Conduct">
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
            <ProtoInput
              className="mt-2"
              placeholder="Phone"
              value={ref.phone ?? ""}
              onChange={(e) => {
                const references = [...form.references];
                references[index] = { ...ref, phone: e.target.value };
                patchForm({ references });
              }}
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
      </div>
    );
  }

  if (stage === "product") {
    return (
      <div className="mt-4 space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          {CATALOG_PRODUCTS.map((product) => (
            <ProtoBtn
              key={product.id}
              ghost={form.productId !== product.id}
              className={
                form.productId === product.id ? "bg-accent text-white" : ""
              }
              onClick={() => patchForm({ productId: product.id })}
            >
              {product.label}
            </ProtoBtn>
          ))}
        </div>
        <ProtoField label="Deposit (KES)">
          <ProtoInput
            type="number"
            value={String(form.deposit)}
            onChange={(e) =>
              patchForm({ deposit: Number(e.target.value) || 0 })
            }
          />
        </ProtoField>
        {quoteDaily ? (
          <p className="text-sm font-bold text-accent-deep">
            Daily installment (from quote): KES {quoteDaily.toLocaleString()}
          </p>
        ) : null}
        <ProtoBtn
          ghost
          disabled={stkPending}
          onClick={() => {
            setStkPending(true);
            window.setTimeout(() => {
              setStkPending(false);
              patchForm({ stkVerified: true });
            }, 1500);
          }}
        >
          {form.stkVerified
            ? "M-Pesa verified (demo)"
            : stkPending
              ? "STK push pending…"
              : "Send STK push (demo)"}
        </ProtoBtn>
      </div>
    );
  }

  if (stage === "bike") {
    return (
      <div className="mt-4 grid gap-2">
        {INVENTORY_BIKES.map((bike) => (
          <button
            key={bike.reg}
            type="button"
            className="jw-tap rounded-2xl border border-line bg-card p-4 text-left"
            onClick={() => patchForm({ bikeReg: bike.reg })}
          >
            <p className="font-bold">{bike.reg}</p>
            <p className="text-sm text-ink-soft">
              {bike.model} · {bike.color}
            </p>
          </button>
        ))}
        {form.bikeReg ? (
          <p className="text-sm font-bold text-accent-deep">
            Selected {form.bikeReg} — 2h soft hold (demo)
          </p>
        ) : null}
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
