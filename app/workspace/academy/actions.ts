"use server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { academyEnrollments, academySubmissions, auditLog } from "../../../db/schema";
import { academyCourses } from "../../academy-data";

export async function saveCourse(formData: FormData) {
  const user=await getChatGPTUser(); if(!user)throw new Error("Sign in to save a course.");
  const code=String(formData.get("code")||"");
  if(!academyCourses.some(c=>c.code===code))throw new Error("Course unavailable.");
  const db=getDb();
  const existing=await db.select().from(academyEnrollments).where(and(eq(academyEnrollments.ownerId,user.userId),eq(academyEnrollments.courseCode,code))).get();
  if(existing)return;
  const id=crypto.randomUUID();
  await db.batch([
    db.insert(academyEnrollments).values({id,ownerId:user.userId,courseCode:code,status:"Saved",createdAt:new Date()}),
    db.insert(auditLog).values({id:crypto.randomUUID(),actorId:user.userId,orgId:null,action:"academy.course.save",resource:"course",resourceId:code,decision:"allow",createdAt:new Date()}),
  ]);
  revalidatePath("/workspace/academy");
}

export async function savePractice(formData: FormData) {
  const user=await getChatGPTUser(); if(!user)throw new Error("Sign in to save practice.");
  const enrollmentId=String(formData.get("enrollmentId")||"");
  const text=String(formData.get("text")||"").trim();
  const reflection=String(formData.get("reflection")||"").trim();
  if(text.length<20||text.length>4000||reflection.length>2000)throw new Error("Describe your work in at least 20 characters.");
  const db=getDb();
  const enrollment=await db.select().from(academyEnrollments).where(and(eq(academyEnrollments.id,enrollmentId),eq(academyEnrollments.ownerId,user.userId))).get();
  if(!enrollment)throw new Error("Course unavailable.");
  const id=crypto.randomUUID();
  await db.batch([
    db.insert(academySubmissions).values({id,enrollmentId,ownerId:user.userId,text,reflection,status:"Draft",createdAt:new Date()}),
    db.insert(auditLog).values({id:crypto.randomUUID(),actorId:user.userId,orgId:null,action:"academy.practice.save",resource:"practice",resourceId:id,decision:"allow",createdAt:new Date()}),
  ]);
  revalidatePath("/workspace/academy");
}
