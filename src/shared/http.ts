export async function fetchJson(
  input: string,
  init: RequestInit,
  timeoutMs: number,
  service: string,
): Promise<{ payload: unknown; response: Response }> {
  const response = await fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) {
    throw new Error(`${service} request failed with HTTP ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`${service} returned invalid JSON.`);
  }
  return { payload, response };
}
