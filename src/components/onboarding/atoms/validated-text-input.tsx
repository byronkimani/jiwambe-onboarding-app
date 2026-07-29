"use client";

import { useState } from "react";
import { ProtoInput } from "@/components/onboarding/atoms/proto-field";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showValidation?: boolean;
  validate: (value: string) => string | null;
  onBlur?: () => void;
  className?: string;
};

export function ValidatedTextInput({
  id,
  value,
  onChange,
  placeholder,
  showValidation = false,
  validate,
  onBlur,
  className,
}: Props) {
  const [touched, setTouched] = useState(false);
  const error =
    (showValidation || touched) && value.trim()
      ? validate(value)
      : showValidation && !value.trim()
        ? validate(value)
        : null;

  return (
    <div>
      <ProtoInput
        id={id}
        value={value}
        placeholder={placeholder}
        className={className}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          setTouched(true);
          onBlur?.();
        }}
      />
      {error ? (
        <p className="mt-1.5 text-[12px] font-semibold text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
