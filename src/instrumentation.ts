/**
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  if (process.env.MOCK_JIWAMBE_API !== "1") {
    return;
  }

  const { ensureJiwambeMsw } = await import("@/mocks/jiwambe-msw-server");
  ensureJiwambeMsw();
}
