import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";
import { SectionCard } from "@/components/onboarding/atoms/section-card";

describe("prototype atoms", () => {
  it("ProtoBtn renders disabled state with prototype tokens", () => {
    render(<ProtoBtn disabled>Continue</ProtoBtn>);
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:bg-slate-bg");
  });

  it("SectionCard renders title and soft tone", () => {
    render(
      <SectionCard title="Personal details" tone="soft">
        <p>Body</p>
      </SectionCard>,
    );
    expect(screen.getByText("Personal details")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
