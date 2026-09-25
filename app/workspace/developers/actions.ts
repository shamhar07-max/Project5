"use server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { apiKeys, auditLog, webhooks } from "../../../db/schema";
import { auditRow, can, publish, str } from "../../../lib/platform";
import { hashKey } from "../../../lib/api";
import { API_SCOPES } from "../../../lib/api-scopes";
import { workspaceContext } from "../access";

async function manager() {
  const ctx = await workspaceContext();
  if (!ctx.orgId || !can(ctx.role, "developer.manage")) throw new Error("Switch to an organization where you are an owner or admin.");
  return ctx as typeof ctx & { orgId: string };
}

export async function addWebhook(form: FormData) {
  const ctx = await manager();
  const url = str(form, "url", 10, 500, "Endpoint URL");
  if (!/^https:\/\/[^\s/]+\.[^\s]+/.test(url)) throw new Error("Webhooks must use an https:// URL.");
  const events = str(form, "events", 1, 400, "Events").split(",").map(s => s.trim()).filter(Boolean).join(",");
  const secret = "whsec_" + Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, "0")).join("");
  const db = getDb();
  await db.batch([
    db.insert(webhooks).values({ id: crypto.randomUUID(), orgId: ctx.orgId, url, secret, events, active: true, createdBy: ctx.user.userId, createdAt: new Date() }),
    db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "webhook.create", "webhook", null)),
  ]);
  revalidatePath("/workspace/developers");
}

export async function toggleWebhook(form: FormData) {
  const ctx = await manager();
  const id = String(form.get("id") || "");
  const db = getDb();
  const w = await db.select().from(webhooks).where(and(eq(webhooks.id, id), eq(webhooks.orgId, ctx.orgId))).get();
  if (!w) throw new Error("Webhook unavailable.");
  await db.batch([db.update(webhooks).set({ active: !w.active }).where(eq(webhooks.id, w.id)), db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, w.active ? "webhook.disable" : "webhook.enable", "webhook", w.id))]);
  revalidatePath("/workspace/developers");
}

export async function sendTestEvent() {
  const ctx = await manager();
  await publish({ type: "developer.test", actorId: ctx.user.userId, orgId: ctx.orgId, resourceType: "organization", resourceId: ctx.orgId, payload: { message: "Test event from DigitalBurj" } });
  revalidatePath("/workspace/developers");
}

/** Creates an API key. The full key is shown once via a short-lived cookie-free redirect param. */
export async function createApiKey(form: FormData) {
  const ctx = await manager();
  const name = str(form, "name", 2, 60, "Key name");
  const scopes = API_SCOPES.filter(s => form.get(`scope:${s}`) === "on");
  if (!scopes.length) throw new Error("Choose at least one scope.");
  const raw = "dbk_" + Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, "0")).join("");
  const db = getDb(); const id = crypto.randomUUID();
  await db.batch([
    db.insert(apiKeys).values({ id, orgId: ctx.orgId, name, prefix: raw.slice(0, 12), hash: await hashKey(raw), scopes: scopes.join(","), createdBy: ctx.user.userId, createdAt: new Date() }),
    db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "apikey.create", "api_key", id)),
  ]);
  revalidatePath("/workspace/developers");
  return raw;
}

export async function revokeApiKey(form: FormData) {
  const ctx = await manager();
  const id = String(form.get("id") || "");
  const db = getDb();
  await db.batch([
    db.update(apiKeys).set({ revokedAt: new Date() }).where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, ctx.orgId), isNull(apiKeys.revokedAt))),
    db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "apikey.revoke", "api_key", id)),
  ]);
  revalidatePath("/workspace/developers");
}
