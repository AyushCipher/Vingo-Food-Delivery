// Validates req.body against a zod schema, replacing it with the parsed
// (trimmed/coerced) result. Rejects with a 400 listing the first issue
// instead of letting bad input reach a controller.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      message: firstIssue ? `${firstIssue.path.join(".") || "body"}: ${firstIssue.message}` : "Invalid request body",
    });
  }
  req.body = result.data;
  next();
};

export default validate;
