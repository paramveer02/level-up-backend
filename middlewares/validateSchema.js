// middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);

  if (!r.success) {
    const errors = {};
    for (const issue of r.error.issues) {
      const field = issue.path.join(".") || "form";
      let msg = issue.message;

      if (issue.code === "invalid_type" && issue.expected === "string") {
        msg = `${field} is required`;
      }
      if (issue.code === "too_small" && issue.minimum === 1) {
        msg = `${field} cannot be empty`;
      }

      errors[field] = msg;
    }
    return res.status(400).json({ status: "fail", errors });
  }

  req.body = r.data;
  next();
};
