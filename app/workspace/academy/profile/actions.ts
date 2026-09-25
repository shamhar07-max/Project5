"use server";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { academyProfiles, auditLog } from "../../../../db/schema";
import { revalidatePath } from "next/cache";

export async function saveAcademyProfile(formData: FormData) {
  const user=await getChatGPTUser(); if(!user)throw new Error("Sign in to update your profile.");
  const learningGoal=String(formData.get("learningGoal")||"").trim();
  const route=String(formData.get("route")||"");
  const weeklyAvailability=String(formData.get("weeklyAvailability")||"").trim();
  if(learningGoal.length>500||weeklyAvailability.length>120||!["Technology","Professional","Business"].includes(route))throw new Error("Check your profile details.");
  const talentConsent=formData.get("talentConsent")==="on";
  const db=getDb();
  await db.batch([
    db.insert(academyProfiles).values({ownerId:user.userId,learningGoal,route,weeklyAvailability,talentConsent,updatedAt:new Date()}).onConflictDoUpdate({target:academyProfiles.ownerId,set:{learningGoal,route,weeklyAvailability,talentConsent,updatedAt:new Date()}}),
    db.insert(auditLog).values({id:crypto.randomUUID(),actorId:user.userId,orgId:null,action:"academy.profile.update",resource:"academy_profile",resourceId:user.userId,decision:"allow",createdAt:new Date()}),
  ]);
  revalidatePath("/workspace/academy/profile");
}
