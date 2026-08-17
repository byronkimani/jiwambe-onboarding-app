"use client";

import type { ImageQualityState } from "@/lib/onboarding/capture/image-quality";

type QualityBadgeProps = {
  quality: ImageQualityState;
};

export function QualityBadge({ quality }: QualityBadgeProps) {
  if (quality === "checking") {
    return (
      <span className="text-[11.5px] font-bold text-blue">
        ✦ Checking quality…
      </span>
    );
  }
  if (!quality) return null;
  if (quality.sharp && !quality.glare) {
    return (
      <span className="text-[11.5px] font-bold text-accent-deep">
        ✦ Sharp · no glare
      </span>
    );
  }
  return (
    <span className="text-[11.5px] font-bold text-amber">
      ⚠ {!quality.sharp ? "Possible blur" : ""}
      {!quality.sharp && quality.glare ? " + " : ""}
      {quality.glare ? "glare detected" : ""} — inspect
    </span>
  );
}
