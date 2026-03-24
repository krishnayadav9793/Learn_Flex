const isPlaceholder = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized.includes("your_") ||
    normalized.includes("connection_string") ||
    normalized.includes("postgres_connection_string") ||
    normalized.includes("mongodb_connection_string") ||
    normalized.includes("jwt_secret")
  );
};

export const hasNeonConfig = () => !isPlaceholder(process.env.NEON_URL);
export const hasJwtConfig = () => !isPlaceholder(process.env.JWT_SECRET);

