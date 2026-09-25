import { api, ApiError } from "../../../../lib/api";
import { searchAll } from "../../../../lib/search";

export const GET = api(async (req, caller) => {
  if (caller.kind !== "user") throw new ApiError(401, "authentication_required", "Search runs as a signed-in person so results match their permissions.");
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return { query: q, results: await searchAll({ user: { userId: caller.userId, email: caller.email }, orgId: caller.orgId }, q) };
});
