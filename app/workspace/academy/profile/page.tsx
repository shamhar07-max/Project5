import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { academyProfiles } from "../../../../db/schema";
import { saveAcademyProfile } from "./actions";

export const dynamic="force-dynamic";
export default async function AcademyProfile(){
  const user=await requireChatGPTUser("/workspace/academy/profile");
  const profile=await getDb().select().from(academyProfiles).where(eq(academyProfiles.ownerId,user.userId)).get();
  return <main className="min-h-screen bg-[#f3f5f7] text-[#102b4c]"><header className="border-b border-[#d6dfe7] bg-white px-6 py-5"><div className="mx-auto max-w-4xl"><Link href="/workspace/academy" className="font-bold text-[#d10b1a]">← My Learning</Link></div></header><div className="mx-auto max-w-4xl px-6 py-12"><h1 className="font-[Georgia] text-4xl font-semibold">Profile & consent</h1><p className="mt-4 text-[#61717a]">Choose your learning route. Sharing learning work with Talent remains optional and requires a separate review before any evidence becomes visible.</p><form action={saveAcademyProfile} className="mt-8 grid gap-5 rounded-2xl border border-[#d6dfe7] bg-white p-6"><p className="font-bold">{user.displayName}</p><label className="font-bold">Learning goal<textarea name="learningGoal" defaultValue={profile?.learningGoal||""} maxLength={500} rows={3} className="mt-2 block w-full rounded-xl border border-[#cbd5df] p-3 font-normal"/></label><div className="grid gap-5 sm:grid-cols-2"><label className="font-bold">Route<select name="route" defaultValue={profile?.route||"Technology"} className="mt-2 block w-full rounded-xl border border-[#cbd5df] p-3 font-normal"><option>Technology</option><option>Professional</option><option>Business</option></select></label><label className="font-bold">Weekly availability<input name="weeklyAvailability" defaultValue={profile?.weeklyAvailability||""} maxLength={120} className="mt-2 block w-full rounded-xl border border-[#cbd5df] p-3 font-normal"/></label></div><label className="flex items-start gap-3 rounded-xl bg-[#e9eef2] p-4"><input type="checkbox" name="talentConsent" defaultChecked={profile?.talentConsent||false} className="mt-1"/><span>Record my interest in sharing assessed evidence with Verified Talent later. This does not publish my work or profile.</span></label><button className="w-fit rounded-xl bg-[#d10b1a] px-6 py-3 font-bold text-white">Save profile</button></form></div></main>;
}
