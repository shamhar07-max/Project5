import { eq } from "drizzle-orm";
import { getDb } from "../../../../../../db";
import { credentials } from "../../../../../../db/schema";
import { api, ApiError } from "../../../../../../lib/api";

// Public credential verification.
export const GET = api(async (_req, _caller, { params }) => {
  const code = (params.code ?? "").toUpperCase();
  if (!/^DBC-[A-Z0-9]{8}$/.test(code)) throw new ApiError(400, "invalid_code", "Credential IDs look like DBC-7Q2KX9MA.");
  const c = await getDb().select().from(credentials).where(eq(credentials.code, code)).get();
  if (!c) throw new ApiError(404, "not_found", "No credential with that ID.");
  return { code: c.code, valid: c.status === "active", status: c.status, holder: c.holderName, title: c.title, unit: c.courseCode, skills: c.skills ? c.skills.split(",").map(s => s.trim()) : [], issuedAt: c.issuedAt };
});
