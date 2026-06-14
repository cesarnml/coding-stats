/**
 * Wraps `fetch` with bounded retries for transient network failures.
 *
 * Upstream APIs (e.g. Shortcut) occasionally drop the connection before the TLS
 * handshake completes — surfacing as `TypeError: fetch failed` with a cause like
 * "Client network socket disconnected before secure TLS connection was
 * established" (ECONNRESET / UND_ERR_SOCKET). These are not reproducible request
 * errors, so a short retry with backoff recovers without bubbling an exception.
 */
export async function fetchWithRetry(
  fetchFn: typeof fetch,
  input: string | URL | Request,
  init?: RequestInit,
  { retries = 2, backoffMs = 250 }: { retries?: number; backoffMs?: number } = {},
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchFn(input, init)
    } catch (error) {
      lastError = error
      if (attempt === retries) break
      await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)))
    }
  }

  throw lastError
}
