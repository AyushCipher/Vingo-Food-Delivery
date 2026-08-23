// Wraps an async Express handler so a thrown/rejected error is forwarded to
// next(err) instead of crashing the process or requiring a try/catch in
// every controller.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
