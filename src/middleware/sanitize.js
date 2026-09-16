function sanitize(obj) {
  if (typeof obj === "string") {
    return obj
      .replace(/<[^>]*>/g, "")
      .trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (obj && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitize(value);
    }
    return cleaned;
  }
  return obj;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }
  next();
}

module.exports = { sanitizeInput };
