"use client";

import { useState } from "react";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";

type StickerSmsBtnProps = {
  phone: string;
};

export function StickerSmsBtn({ phone }: StickerSmsBtnProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  if (state === "sent") {
    return (
      <span className="self-center text-[12.5px] font-bold text-accent-deep">
        ✓ Sent to {phone}
      </span>
    );
  }

  return (
    <ProtoBtn
      small
      disabled={state === "sending"}
      onClick={() => {
        setState("sending");
        window.setTimeout(() => setState("sent"), 1000);
      }}
    >
      {state === "sending" ? "Sending…" : "Send via SMS"}
    </ProtoBtn>
  );
}
