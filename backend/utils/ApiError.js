// A known, intentional error with an HTTP status code — as opposed to an
// unexpected exception (DB down, bad code, etc). The centralized error
// handler shows this error's message to the client as-is; anything else
// gets a generic message so internals never leak to the response body.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isApiError = true;
  }
}

export default ApiError;
