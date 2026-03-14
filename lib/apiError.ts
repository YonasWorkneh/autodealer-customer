/**
 * Extracts a user-facing error message from a backend API error response body.
 * Handles common shapes: { detail }, { message }, { error }, or field errors like { email: ["..."] }.
 */
export function getBackendErrorMessage(
  errData: Record<string, unknown> | null | undefined,
  fallback: string = "Something went wrong."
): string {
  if (!errData || typeof errData !== "object") return fallback;

  const d = errData as Record<string, unknown>;
  if (typeof d.detail === "string" && d.detail) return d.detail;
  if (typeof d.message === "string" && d.message) return d.message;
  if (typeof d.error === "string" && d.error) return d.error;

  // Django-style field errors: { email: ["Invalid email"], password: ["Too short"] }
  for (const key of Object.keys(d)) {
    const val = d[key];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
      return val[0];
    }
  }
  if (Array.isArray(d.non_field_errors) && d.non_field_errors.length > 0 && typeof d.non_field_errors[0] === "string") {
    return d.non_field_errors[0];
  }

  return fallback;
}
