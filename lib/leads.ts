import { z } from "zod";

export const leadTopics = {
  academy: "Academy",
  studio: "Studio",
  business: "Business AI",
  talent: "Verified Talent",
  jobs: "Jobs",
  general: "General enquiry",
} as const;
export type LeadTopic = keyof typeof leadTopics;

export const leadTimings: Record<string, string> = { exploring: "Just exploring", soon: "In the next month", now: "Urgent" };

export const leadSchema = z.object({
  channel: z.enum(["whatsapp", "web", "mobile"]),
  topic: z.enum(Object.keys(leadTopics) as [LeadTopic, ...LeadTopic[]]),
  intent: z.string().trim().max(60).default(""),
  timing: z.string().trim().max(20).default(""),
  name: z.string().trim().min(2, "Please add your name.").max(80),
  contact: z.string().trim().min(5, "Add a phone number or email so we can reply.").max(120)
    .refine(v => /^[+()\d\s-]{7,20}$/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Use a phone number or an email address."),
  company: z.string().trim().max(120).default(""),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(1500),
  sourcePath: z.string().trim().max(200).default(""),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});
export type LeadInput = z.infer<typeof leadSchema>;

/** Short, human-readable reference such as DB-7Q2K (no ambiguous 0/O/1/I). */
export function leadReference() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return "DB-" + Array.from(bytes, b => alphabet[b % alphabet.length]).join("");
}

export function composeWhatsAppMessage(l: Pick<LeadInput, "topic" | "intent" | "timing" | "name" | "company" | "message">, reference?: string) {
  return [
    "Hello DigitalBurj 👋",
    reference ? `Ref: ${reference}` : null,
    `Topic: ${leadTopics[l.topic]}`,
    l.intent ? `Goal: ${l.intent}` : null,
    l.timing ? `Timing: ${leadTimings[l.timing] ?? l.timing}` : null,
    `From: ${l.name}${l.company ? ` (${l.company})` : ""}`,
    "",
    l.message,
  ].filter(v => v !== null).join("\n");
}

/** The official business number, digits only, or null when it has not been configured. */
export function whatsappNumber() {
  const digits = (process.env.DIGITALBURJ_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function whatsappUrl(text: string) {
  const n = whatsappNumber();
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

export function staffEmails() {
  return (process.env.DIGITALBURJ_STAFF_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
}
