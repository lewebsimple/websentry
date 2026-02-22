export function normalizeHeaders(headers?: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  if (!headers) return result;
  for (const [key, value] of Object.entries(headers)) {
    result[key.toLowerCase()] = value.trim();
  }
  return result;
}
