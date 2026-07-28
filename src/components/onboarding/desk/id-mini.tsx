export function IdMini({ width = 96 }: { width?: number }) {
  const height = Math.round(width * 0.72);
  return (
    <div
      className="flex shrink-0 flex-col gap-1 rounded-lg border border-line bg-[#E9F0EA] p-1.5"
      style={{ width, height }}
    >
      <div className="h-[3px] w-[58%] rounded-sm bg-accent opacity-[0.28]" />
      <div className="flex flex-1 items-end justify-center overflow-hidden rounded-[5px] border border-accent/20 bg-[#DEE9E1]">
        <svg viewBox="0 0 40 28" className="block w-[62%]">
          <circle cx="20" cy="10" r="6.5" fill="currentColor" className="text-accent opacity-[0.38]" />
          <path
            d="M5 28 Q20 15 35 28 Z"
            fill="currentColor"
            className="text-accent opacity-[0.38]"
          />
        </svg>
      </div>
      <div className="flex gap-[3px]">
        <span className="h-[2.5px] flex-1 rounded-sm bg-accent opacity-[0.18]" />
        <span className="h-[2.5px] flex-[2] rounded-sm bg-accent opacity-[0.18]" />
      </div>
    </div>
  );
}
