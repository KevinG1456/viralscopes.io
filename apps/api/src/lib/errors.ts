// Matches the standard response envelope in URL_and_API_Structure.md §20:
// { success: false, error: { code, message, details? } }. Every auth
// failure response in this phase is built from this class so the shape is
// consistent and no handler improvises its own error JSON.
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function toErrorEnvelope(err: AppError): {
  success: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
} {
  return {
    success: false,
    error: { code: err.code, message: err.message, details: err.details },
  };
}
