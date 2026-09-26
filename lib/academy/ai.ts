// Optional Claude drafting for the Creator Studio. Enabled only when
// ANTHROPIC_API_KEY is configured; otherwise the studio uses its template engine.
import Anthropic from "@anthropic-ai/sdk";
import type { StudioTool } from "./plans";
import { PROMPTS, SCHEMAS } from "./studio";

export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

const SYSTEM = "You are the drafting assistant inside DigitalBurj Academy's Creator Studio, used by teachers, trainers and course creators. Produce practical, specific, classroom- and workplace-ready material in clear international English. Never invent statistics about real organisations or people; label any numbers as illustrative targets. Respond only with JSON matching the schema.";

export type AiResult = { ok: true; data: unknown } | { ok: false; reason: string };

export async function draftWithClaude(tool: StudioTool, brief: Record<string, unknown>): Promise<AiResult> {
  if (!aiEnabled()) return { ok: false, reason: "not_configured" };
  const client = new Anthropic({ maxRetries: 1, timeout: 90_000 });
  try {
    const res = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMAS[tool] } },
      system: SYSTEM,
      messages: [{ role: "user", content: `${PROMPTS[tool]}\n\nBrief (JSON):\n${JSON.stringify(brief)}` }],
    });
    if (res.stop_reason === "refusal") return { ok: false, reason: "refusal" };
    if (res.stop_reason === "max_tokens") return { ok: false, reason: "too_long" };
    const text = res.content.flatMap(b => (b.type === "text" ? [b.text] : [])).join("");
    return { ok: true, data: JSON.parse(text) };
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { ok: false, reason: "rate_limited" };
    if (e instanceof Anthropic.AuthenticationError) return { ok: false, reason: "auth" };
    if (e instanceof Anthropic.APIError) return { ok: false, reason: `api_${e.status ?? "error"}` };
    if (e instanceof SyntaxError) return { ok: false, reason: "bad_json" };
    return { ok: false, reason: "network" };
  }
}
