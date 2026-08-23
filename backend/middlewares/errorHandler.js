import logger from "../config/logger.js";

// Centralized error handler — the single place that decides what an error
// looks like on the wire. Known ApiErrors show their own message; anything
// else (DB errors, bugs, etc.) is logged in full server-side but only ever
// returns a generic message to the client, so internals never leak.
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.isApiError ? err.statusCode : err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  const isKnown = err.isApiError || (statusCode >= 400 && statusCode < 500);

  logger.error({ err, path: req.path, method: req.method }, err.message);

  res.status(statusCode).json({
    success: false,
    message: isKnown ? err.message : "Something went wrong. Please try again.",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export default errorHandler;
