function handleError(res, error, context = "Operation") {
  console.error(`${context} error:`, error.message);

  if (error.name === "ZodError") {
    return res.status(400).json({ error: error.errors[0].message });
  }

  if (error.code === "P2002") {
    return res.status(400).json({ error: "A record with that value already exists" });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }

  res.status(500).json({ error: "Internal server error" });
}

module.exports = { handleError };
