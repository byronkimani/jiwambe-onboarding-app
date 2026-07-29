type Props = {
  show: boolean;
  message?: string | null;
};

export function CaptureInlineError({ show, message }: Props) {
  if (!show || !message) return null;
  return (
    <p className="mt-1.5 text-[12.5px] font-semibold text-red-600" role="alert">
      {message}
    </p>
  );
}
