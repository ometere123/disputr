export function dbErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function dbErrorCode(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  return typeof record.code === "string" ? record.code : "";
}

export function isEmailConflictError(error: unknown) {
  const code = dbErrorCode(error);
  const text = dbErrorText(error).toLowerCase();

  return code === "23505" && (text.includes("users_email_idx") || text.includes("email"));
}

export function isSchemaMismatchError(error: unknown) {
  const code = dbErrorCode(error);
  return code === "42703" || code === "42P01";
}
