import { api, page } from "../../../../../lib/api";
import { academyCourses } from "../../../../academy-data";

export const GET = api(async req => {
  const { limit, offset } = page(req);
  const family = new URL(req.url).searchParams.get("family");
  const all = academyCourses.filter(c => !family || c.family === family);
  return { data: all.slice(offset, offset + limit), total: all.length, limit, offset };
});
