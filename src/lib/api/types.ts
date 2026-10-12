/** Shared API envelope types aligned with meracoachapi GenericResponse. */

export type ApiError = {
  errorCode: number;
  errorMessage: string;
};

export type GenericResponse<T> = {
  errorObj?: ApiError[];
  responseObj?: T | null;
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly errors: ApiError[];

  constructor(message: string, status: number, errors: ApiError[] = []) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}
