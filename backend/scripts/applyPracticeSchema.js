import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "../util/neonConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!sql) {
  console.error("NEON_URL is missing. Set it in backend/.env before applying schema.");
  process.exit(1);
}

const schemaPath = path.join(__dirname, "..", "sql", "practice_mode_schema.sql");

const run = async () => {
  const schemaSql = await fs.readFile(schemaPath, "utf8");
  const statements = schemaSql
    .split(/;\s*\r?\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log("Practice mode schema applied successfully.");
};

run().catch((error) => {
  console.error("Failed to apply practice mode schema:", error.message || error);
  process.exit(1);
});
