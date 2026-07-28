"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  createEmptyCaptureForm,
  type CaptureFormState,
} from "@/lib/onboarding/capture/types";

type CaptureWizardContextValue = {
  form: CaptureFormState;
  patchForm: (patch: Partial<CaptureFormState>) => void;
  resetForm: () => void;
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

  const patchForm = useCallback((patch: Partial<CaptureFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(createEmptyCaptureForm());
  }, []);

  const value = useMemo(
    () => ({ form, patchForm, resetForm }),
    [form, patchForm, resetForm],
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
