"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  patchBodyForOperatingModelType,
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
import {
  isCaptureDirty,
  snapshotCaptureForm,
} from "@/lib/onboarding/capture/capture-dirty-state";
import {
  allCaptureDocIdsFromForm,
  formPatchForClearedDocument,
  formPatchForUploadedDocument,
  previewAndDocIdFromForm,
} from "@/lib/onboarding/capture/capture-form-documents";
import {
  buildClearPatchesForPurposes,
  getStaleDocumentPurposesAfterPatch,
} from "@/lib/onboarding/capture/capture-document-requirements";
import {
  createEmptyDocumentUploadState,
  type DocumentUploadState,
  syncDocumentUploadStateFromForm,
} from "@/lib/onboarding/capture/document-upload-state";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";
import { uploadApplicationDocument } from "@/lib/onboarding/documents/upload-application-document";
import { apiPatchApplication } from "@/lib/onboarding/capture/application-api";

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
  documentUploads: DocumentUploadState;
  isDirty: boolean;
  setApiError: (message: string | null) => void;
  clearConflictRecovered: () => void;
  createApplicationFromReadiness: () => Promise<
    { ok: true; referenceCode: string } | { ok: false }
  >;
  patchApplicationForStage: (
    stage: CaptureStageKey,
  ) => Promise<{ ok: true; recovered?: boolean } | { ok: false }>;
  saveDraftForStage: (stage: CaptureStageKey) => Promise<boolean>;
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
  captureDocument: (purpose: DocumentPurpose, file: File) => void;
  retryDocumentUpload: (purpose: DocumentPurpose) => void;
  clearDocumentSlot: (purpose: DocumentPurpose) => void;
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
  const [savedFormSnapshot, setSavedFormSnapshot] =
    useState<CaptureFormState | null>(null);
  const [documentUploads, setDocumentUploads] = useState<DocumentUploadState>(
    createEmptyDocumentUploadState,
  );
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  const [patching, setPatching] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [conflictRecovered, setConflictRecovered] = useState(false);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const formRef = useRef(form);
  const versionRef = useRef(version);

  useEffect(() => {
    formRef.current = form;
    versionRef.current = version;
  }, [form, version]);

  const trackBlobUrl = useCallback((url: string) => {
    if (url.startsWith("blob:")) {
      blobUrlsRef.current.add(url);
    }
  }, []);

  const revokeBlobUrl = useCallback((url: string | null | undefined) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  }, []);

  const commitSavedSnapshot = useCallback((nextForm: CaptureFormState) => {
    setSavedFormSnapshot(snapshotCaptureForm(nextForm));
  }, []);

  const syncFromResource = useCallback((resource: OnboardingApplicationResource) => {
    setApplicationId(resource.id);
    setReferenceCode(resource.referenceCode);
    setVersion(resource.version);
  }, []);

  const persistOperatingModelType = useCallback(
    async (nextForm: CaptureFormState): Promise<boolean> => {
      const ref = referenceCode;
      const ver = versionRef.current;
      if (!ref || ver === null || !nextForm.opModel) return true;
      const body = patchBodyForOperatingModelType(nextForm, ver);
      if (!body) return true;
      const result = await apiPatchApplication(ref, body);
      if (result.ok) {
        syncFromResource(result.application);
        return true;
      }
      return false;
    },
    [referenceCode, syncFromResource],
  );

  const patchForm = useCallback(
    (patch: Partial<CaptureFormState>) => {
      setForm((prev) => {
        const stalePurposes = getStaleDocumentPurposesAfterPatch(prev, patch);
        const clearPatch = buildClearPatchesForPurposes(stalePurposes);
        for (const purpose of stalePurposes) {
          const { preview } = previewAndDocIdFromForm(prev, purpose);
          revokeBlobUrl(preview);
          setDocumentUploads((uploadPrev) => ({
            ...uploadPrev,
            [purpose]: { status: "idle", pendingFile: null, error: null },
          }));
        }
        const next = { ...prev, ...patch, ...clearPatch };
        if (patch.opModel !== undefined && patch.opModel !== prev.opModel) {
          void persistOperatingModelType(next);
        }
        return next;
      });
    },
    [revokeBlobUrl, persistOperatingModelType],
  );

  const resetForm = useCallback(() => {
    for (const url of blobUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    blobUrlsRef.current.clear();
    setForm(createEmptyCaptureForm());
    setSavedFormSnapshot(null);
    setDocumentUploads(createEmptyDocumentUploadState());
    setApplicationId(null);
    setReferenceCode(null);
    setVersion(null);
    setApiError(null);
    setResumeError(null);
    setConflictRecovered(false);
  }, []);

  const loadFormFromResource = useCallback(
    (resource: OnboardingApplicationResource) => {
      const hydrated = hydrateCaptureFormFromResource(resource);
      setForm(hydrated);
      syncFromResource(resource);
      commitSavedSnapshot(hydrated);
      setDocumentUploads(
        syncDocumentUploadStateFromForm(allCaptureDocIdsFromForm(hydrated)),
      );
    },
    [syncFromResource, commitSavedSnapshot],
  );

  const executeDocumentUpload = useCallback(
    async (purpose: DocumentPurpose, file: File) => {
      if (!referenceCode) return;

      if (
        (purpose === "consent_document" || purpose === "business_registration") &&
        formRef.current.opModel
      ) {
        const persisted = await persistOperatingModelType(formRef.current);
        if (!persisted) {
          setDocumentUploads((prev) => ({
            ...prev,
            [purpose]: {
              status: "failed",
              pendingFile: file,
              error: "Could not save operating model. Try again.",
            },
          }));
          return;
        }
      }

      setDocumentUploads((prev) => ({
        ...prev,
        [purpose]: {
          status: "uploading",
          pendingFile: file,
          error: null,
        },
      }));

      try {
        const uploaded = await uploadApplicationDocument({
          applicationId: referenceCode,
          purpose,
          file,
        });

        setForm((prev) => {
          const { preview } = previewAndDocIdFromForm(prev, purpose);
          revokeBlobUrl(preview);
          return {
            ...prev,
            ...formPatchForUploadedDocument(
              purpose,
              uploaded.url,
              uploaded.documentId,
            ),
          };
        });

        syncFromResource(uploaded.application);
        setDocumentUploads((prev) => ({
          ...prev,
          [purpose]: {
            status: "uploaded",
            pendingFile: null,
            error: null,
          },
        }));
      } catch {
        setDocumentUploads((prev) => ({
          ...prev,
          [purpose]: {
            status: "failed",
            pendingFile: file,
            error: "Upload failed. Try again.",
          },
        }));
      }
    },
    [referenceCode, syncFromResource, revokeBlobUrl, persistOperatingModelType],
  );

  const captureDocument = useCallback(
    (purpose: DocumentPurpose, file: File) => {
      const preview = URL.createObjectURL(file);
      trackBlobUrl(preview);
      const { preview: currentPreview } = previewAndDocIdFromForm(
        formRef.current,
        purpose,
      );
      revokeBlobUrl(currentPreview);
      patchForm({
        ...formPatchForClearedDocument(purpose),
        ...formPatchForUploadedDocument(purpose, preview, null),
      });

      if (!referenceCode) {
        setDocumentUploads((prev) => ({
          ...prev,
          [purpose]: {
            status: "failed",
            pendingFile: file,
            error: "Start the application from readiness before uploading.",
          },
        }));
        return;
      }

      void executeDocumentUpload(purpose, file);
    },
    [
      referenceCode,
      patchForm,
      trackBlobUrl,
      revokeBlobUrl,
      executeDocumentUpload,
    ],
  );

  const retryDocumentUpload = useCallback(
    (purpose: DocumentPurpose) => {
      const file = documentUploads[purpose].pendingFile;
      if (!file || !referenceCode) return;
      void executeDocumentUpload(purpose, file);
    },
    [documentUploads, referenceCode, executeDocumentUpload],
  );

  const clearDocumentSlot = useCallback(
    (purpose: DocumentPurpose) => {
      const { preview } = previewAndDocIdFromForm(formRef.current, purpose);
      revokeBlobUrl(preview);
      patchForm(formPatchForClearedDocument(purpose));
      setDocumentUploads((prev) => ({
        ...prev,
        [purpose]: { status: "idle", pendingFile: null, error: null },
      }));
    },
    [patchForm, revokeBlobUrl],
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
    commitSavedSnapshot(form);
    return {
      ok: true as const,
      referenceCode: result.application.referenceCode,
    };
  }, [form, syncFromResource, commitSavedSnapshot]);

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
        buildPatch: (patchVersion, patchFormState) =>
          patchBodyForStage(stage, patchFormState, patchVersion, {
            leadId: patchFormState.selectedLeadId,
            leadSource: patchFormState.selectedLeadSource,
          }),
      });

      setPatching(false);

      if (!result.ok) {
        setApiError(result.message);
        return { ok: false as const };
      }

      if (result.skipped) {
        commitSavedSnapshot(form);
        return { ok: true as const };
      }

      syncFromResource(result.application);
      const nextForm = result.form ?? form;
      if (result.form) {
        setForm(result.form);
      }
      commitSavedSnapshot(nextForm);
      if (result.recoveredFromConflict) {
        setConflictRecovered(true);
      }
      return { ok: true as const, recovered: result.recoveredFromConflict };
    },
    [form, referenceCode, version, syncFromResource, commitSavedSnapshot],
  );

  const saveDraftForStage = useCallback(
    async (stage: CaptureStageKey) => {
      if (!referenceCode || version === null) {
        return true;
      }

      setPatching(true);
      setApiError(null);
      setConflictRecovered(false);

      const result = await patchApplicationWithVersionRecovery({
        referenceCode,
        version,
        form,
        buildPatch: (patchVersion, patchFormState) =>
          draftPatchBodyForStage(stage, patchFormState, patchVersion, {
            leadId: patchFormState.selectedLeadId,
            leadSource: patchFormState.selectedLeadSource,
          }),
      });

      setPatching(false);

      if (!result.ok) {
        setApiError(result.message);
        return false;
      }

      if (!result.skipped) {
        syncFromResource(result.application);
        const nextForm = result.form ?? form;
        if (result.form) {
          setForm(result.form);
        }
        commitSavedSnapshot(nextForm);
        if (result.recoveredFromConflict) {
          setConflictRecovered(true);
        }
      } else {
        commitSavedSnapshot(form);
      }

      return true;
    },
    [form, referenceCode, version, syncFromResource, commitSavedSnapshot],
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
        buildPatch: (patchVersion, patchFormState) =>
          draftPatchBodyForStage(stage, patchFormState, patchVersion, {
            leadId: patchFormState.selectedLeadId,
            leadSource: patchFormState.selectedLeadSource,
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

  const isDirty = useMemo(
    () =>
      isCaptureDirty({
        form,
        savedFormSnapshot,
        documentUploads,
      }),
    [form, savedFormSnapshot, documentUploads],
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
      documentUploads,
      isDirty,
      setApiError,
      clearConflictRecovered,
      createApplicationFromReadiness,
      patchApplicationForStage,
      saveDraftForStage,
      pauseApplication,
      submitApplication,
      disqualifyApplication,
      resumeApplication,
      syncFromResource,
      captureDocument,
      retryDocumentUpload,
      clearDocumentSlot,
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
      documentUploads,
      isDirty,
      clearConflictRecovered,
      createApplicationFromReadiness,
      patchApplicationForStage,
      saveDraftForStage,
      pauseApplication,
      submitApplication,
      disqualifyApplication,
      resumeApplication,
      syncFromResource,
      captureDocument,
      retryDocumentUpload,
      clearDocumentSlot,
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
