"use client";

import { useCallback, useState } from "react";
import {
  KENYA_PHONE_FIELD_HINT,
  KENYA_PHONE_INPUT_PLACEHOLDER,
  KENYA_PHONE_VALIDATION_MESSAGE,
} from "@/lib/global/auth/phone-field-constants";
import {
  isValidKenyaNationalPhone,
  sanitizeNationalPhoneInput,
} from "@/lib/global/auth/normalize-phone";
import { ProtoInput } from "@/components/onboarding/atoms/proto-field";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
  onBlur?: () => void;
  className?: string;
};

export function KenyaPhoneInput({
  id,
  value,
  onChange,
  showValidation = false,
  onBlur,
  className,
}: Props) {
  const [touched, setTouched] = useState(false);
  const showError = (showValidation || touched) && value.trim().length > 0;
  const digits = value.replace(/\D/g, "");
  const invalid =
    showError && digits.length > 0 && !isValidKenyaNationalPhone(digits);
  const errorMessage =
    showError && !value.trim()
      ? "Phone is required."
      : invalid
        ? KENYA_PHONE_VALIDATION_MESSAGE
        : null;

  return (
    <div>
      <ProtoInput
        id={id}
        inputMode="tel"
        autoComplete="tel"
        placeholder={KENYA_PHONE_INPUT_PLACEHOLDER}
        value={value}
        className={className}
        aria-invalid={errorMessage ? true : undefined}
        onChange={(e) => onChange(sanitizeNationalPhoneInput(e.target.value))}
        onBlur={() => {
          setTouched(true);
          onBlur?.();
        }}
      />
      <p className="mt-1 text-[12px] text-ink-soft">{KENYA_PHONE_FIELD_HINT}</p>
      {errorMessage ? (
        <p className="mt-1.5 text-[12px] font-semibold text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function isKenyaPhoneFieldValid(value: string): boolean {
  if (!value.trim()) return false;
  const digits = value.replace(/\D/g, "");
  return isValidKenyaNationalPhone(digits);
}
