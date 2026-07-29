"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import type { CaptureStageKey } from "@/lib/global/shared/routes";
import {
  apiFetchApplication,
  apiCreateApplication,
  apiPauseApplication,
  apiSubmitApplication,
  apiDisqualifyApplication,
} from "@/lib/onboarding/capture/application-api";
import {
  createApplicationBodyFromForm,
  patchBodyForStage,
} from "@/lib/onboarding/capture/form-to-resource-patch";
import { draftPatchBodyForStage } from "@/lib/onboarding/capture/draft-patch-for-stage";
import { patchApplicationWithVersionRecovery } from "@/lib/onboarding/capture/patch-application-with-recovery";
import { hydrateCaptureFormFromResource } from "@/lib/onboarding/capture/resource-to-capture-form";
import { isFormReadyForSubmit } from "@/lib/onboarding/capture/stage-validation";
import {
  createEmptyCaptureForm,
  type CaptureFormState,
} from "@/lib/onboarding/capture/types";

type CaptureWizardContextValue = {
  form: CaptureFormState;
  patchForm: (patch: Partial<CaptureFormState>) => void;
  resetForm: () => void;
  applicationId: string | null;
  referenceCode: string | null;
  version: number | null;
  patching: boolean;
  resumeLoading: boolean;
  resumeError: string | null;
  apiError: string | null;
  conflictRecovered: boolean;
  setApiError: (message: string | null) => void;
  clearConflictRecovered: () => void;
  createApplicationFromReadiness: () => Promise<
    { ok: true; referenceCode: string } | { ok: false }
  >;
  patchApplicationForStage: (
    stage: CaptureStageKey,
  ) => Promise<{ ok: true; recovered?: boolean } | { ok: false }>;
  pauseApplication: (stage: CaptureStageKey, reason: string) => Promise<boolean>;
  submitApplication: () => Promise<
    | { ok: true }
    | { ok: false; blockingIssues?: { code: string; message: string }[] }
  >;
  disqualifyApplication: (reason: string) => Promise<boolean>;
  resumeApplication: (
    referenceCode: string,
  ) => Promise<
    | { ok: true; application: OnboardingApplicationResource }
    | { ok: false; message: string }
  >;
  syncFromResource: (resource: OnboardingApplicationResource) => void;
};

const CaptureWizardContext = createContext<CaptureWizardContextValue | null>(
  null,
);

export function CaptureWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [form, setForm] = useState<CaptureFormState>(createEmptyCaptureForm);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  const [patching, setPatching] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [conflictRecovered, setConflictRecovered] = useState(false);

  const patchForm = useCallback((patch: Partial<CaptureFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(createEmptyCaptureForm());
    setApplicationId(null);
    setReferenceCode(null);
    setVersion(null);
    setApiError(null);
    setResumeError(null);
    setConflictRecovered(false);
  }, []);

  const syncFromResource = useCallback((resource: OnboardingApplicationResource) => {
    setApplicationId(resource.id);
    setReferenceCode(resource.referenceCode);
    setVersion(resource.version);
  }, []);

  const loadFormFromResource = useCallback(
    (resource: OnboardingApplicationResource) => {
      setForm(hydrateCaptureFormFromResource(resource));
      syncFromResource(resource);
    },
    [syncFromResource],
  );

  const resumeApplication = useCallback(
    async (ref: string) => {
      setResumeLoading(true);
      setResumeError(null);
      setApiError(null);
      const result = await apiFetchApplication(ref);
      setResumeLoading(false);
      if (!result.ok) {
        const message = result.message;
        setResumeError(message);
        return { ok: false as const, message };
      }
      loadFormFromResource(result.application);
      return { ok: true as const, application: result.application };
    },
    [loadFormFromResource],
  );

  const clearConflictRecovered = useCallback(() => {
    setConflictRecovered(false);
  }, []);

  const createApplicationFromReadiness = useCallback(async () => {
    setPatching(true);
    setApiError(null);
    const body = createApplicationBodyFromForm(form);
    const result = await apiCreateApplication(body);
    setPatching(false);
    if (!result.ok) {
      setApiError(result.message);
      return { ok: false as const };
    }
    syncFromResource(result.application);
    return {
      ok: true as const,
      referenceCode: result.application.referenceCode,
    };
  }, [form, syncFromResource]);

  const patchApplicationForStage = useCallback(
    async (stage: CaptureStageKey) => {
      if (!referenceCode || version === null) {
        setApiError("Application not created yet.");
        return { ok: false as const };
      }

      setPatching(true);
      setApiError(null);
      setConflictRecovered(false);

      const result = await patchApplicationWithVersionRecovery({
        referenceCode,
        version,
        form,
        buildPatch: (patchVersion, patchForm) =>
          patchBodyForStage(stage, patchForm, patchVersion, {
            leadId: patchForm.selectedLeadId,
            leadSource: patchForm.selectedLeadSource,
          }),
      });

      setPatching(false);

      if (!result.ok) {
        setApiError(result.message);
        return { ok: false as const };
      }

      if (result.skipped) {
        return { ok: true as const };
      }

      syncFromResource(result.application);
      if (result.form) {
        setForm(result.form);
      }
      const recovered = result.recoveredFromConflict;
      if (recovered) {
        setConflictRecovered(true);
      }
      return { ok: true as const, recovered };
    },
    [form, referenceCode, version, syncFromResource],
  );

  const pauseApplication = useCallback(
    async (stage: CaptureStageKey, reason: string) => {
      if (!referenceCode || version === null) {
        setApiError("Application not created yet.");
        return false;
      }

      setPatching(true);
      setApiError(null);
      setConflictRecovered(false);

      const draftResult = await patchApplicationWithVersionRecovery({
        referenceCode,
        version,
        form,
        buildPatch: (patchVersion, patchForm) =>
          draftPatchBodyForStage(stage, patchForm, patchVersion, {
            leadId: patchForm.selectedLeadId,
            leadSource: patchForm.selectedLeadSource,
          }),
      });

      if (!draftResult.ok) {
        setPatching(false);
        setApiError(draftResult.message);
        return false;
      }

      if (!draftResult.skipped) {
        syncFromResource(draftResult.application);
        if (draftResult.form) {
          setForm(draftResult.form);
        }
        if (draftResult.recoveredFromConflict) {
          setConflictRecovered(true);
        }
      }

      const pauseResult = await apiPauseApplication(referenceCode, { reason });
      setPatching(false);
      if (!pauseResult.ok) {
        setApiError(pauseResult.message);
        return false;
      }

      resetForm();
      return true;
    },
    [form, referenceCode, version, syncFromResource, resetForm],
  );

  const submitApplication = useCallback(async () => {
    if (!referenceCode) {
      setApiError("Application not created yet.");
      return { ok: false as const };
    }

    if (!isFormReadyForSubmit(form)) {
      setApiError("Complete every required field before submitting.");
      return { ok: false as const };
    }

    setPatching(true);
    setApiError(null);

    for (const stage of ["product", "bike"] as const) {
      const synced = await patchApplicationForStage(stage);
      if (!synced.ok) {
        setPatching(false);
        return { ok: false as const };
      }
    }

    const result = await apiSubmitApplication(referenceCode, {
      officerAttestation: true,
    });
    setPatching(false);

    if (!result.ok) {
      setApiError(result.message);
      return {
        ok: false as const,
        blockingIssues: result.blockingIssues,
      };
    }

    resetForm();
    return { ok: true as const };
  }, [referenceCode, form, patchApplicationForStage, resetForm]);

  const disqualifyApplication = useCallback(
    async (reason: string) => {
      if (!referenceCode) {
        setApiError("Application not created yet.");
        return false;
      }

      setPatching(true);
      setApiError(null);
      const result = await apiDisqualifyApplication(referenceCode, { reason });
      setPatching(false);

      if (!result.ok) {
        setApiError(result.message);
        return false;
      }

      resetForm();
      return true;
    },
    [referenceCode, resetForm],
  );

  const value = useMemo(
    () => ({
      form,
      patchForm,
      resetForm,
      applicationId,
      referenceCode,
      version,
      patching,
      resumeLoading,
      resumeError,
      apiError,
      conflictRecovered,
      setApiError,
      clearConflictRecovered,
      createApplicationFromReadiness,
      patchApplicationForStage,
      pauseApplication,
      submitApplication,
      disqualifyApplication,
      resumeApplication,
      syncFromResource,
    }),
    [
      form,
      patchForm,
      resetForm,
      applicationId,
      referenceCode,
      version,
      patching,
      resumeLoading,
      resumeError,
      apiError,
      conflictRecovered,
      createApplicationFromReadiness,
      patchApplicationForStage,
      pauseApplication,
      submitApplication,
      disqualifyApplication,
      resumeApplication,
      syncFromResource,
    ],
  );

  return (
    <CaptureWizardContext.Provider value={value}>
      {children}
    </CaptureWizardContext.Provider>
  );
}

export function useCaptureWizard(): CaptureWizardContextValue {
  const ctx = useContext(CaptureWizardContext);
  if (!ctx) {
    throw new Error("useCaptureWizard must be used within CaptureWizardProvider");
  }
  return ctx;
}
