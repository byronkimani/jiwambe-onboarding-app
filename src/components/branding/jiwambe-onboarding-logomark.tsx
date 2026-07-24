import type { SVGProps } from "react";

const LOGOMARK_PATH =
  "M20.04 0c11.05 0 20 8.95 20 20s-8.96 20-20 20c-11.05 0-20-8.95-20-20s8.95-20 20-20m-7.16 25.32v10.26a20.1 20.1 0 0 0 5.97 1.52v-8.87h2.92v8.84a20.1 20.1 0 0 0 5.98-1.74V25.3l-7.43-7.42-7.44 7.45Zm-8.86.8a17.2 17.2 0 0 0 6.04 7.82v-5.79l-.02.02v-4.04l10.28-10.28.01.01.01-.01 10.28 10.28v.16h.01v9.2a17.17 17.17 0 0 0 5.59-7.78L20.32 9.82zM14.33 3.83C7.67 6.18 2.89 12.53 2.89 20c0 1 .09 1.99.25 2.95L18.3 7.8l-3.89-3.89-.07-.08Zm11.74.24L22.34 7.8l14.67 14.67c.12-.81.18-1.63.18-2.47 0-7.31-4.58-13.56-11.03-16.02l-.08.09Zm-6.03-1.21c-.84 0-1.66.06-2.47.18l2.75 2.74 2.67-2.67c-.96-.17-1.94-.25-2.95-.25";

type JiwambeOnboardingLogomarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function JiwambeOnboardingLogomark({
  size = 44,
  className,
  ...props
}: JiwambeOnboardingLogomarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      aria-hidden
      className={className}
      {...props}
    >
      <path fill="currentColor" d={LOGOMARK_PATH} />
    </svg>
  );
}
