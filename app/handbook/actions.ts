"use server";

import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/auth";
import { getManual, getSection } from "@/lib/handbook";
import {
  canEditHandbook,
  addHandbookNote,
  addHandbookFile,
  deleteHandbookEntry,
} from "@/lib/store";

type Result = { error?: string; ok?: boolean };

async function guard(manualSlug: string, sectionSlug: string) {
  const user = await getCurrentEmployee();
  if (!user) return { error: "請先登入" as const };
  if (!canEditHandbook(user)) return { error: "沒有編輯權限" as const };
  const manual = getManual(manualSlug);
  if (!manual) return { error: "手冊不存在" as const };
  const section = getSection(manual, sectionSlug);
  if (!section) return { error: "章節不存在" as const };
  return { user };
}

export async function addNoteAction(_prev: Result | null, formData: FormData): Promise<Result> {
  const manualSlug = String(formData.get("manualSlug") || "");
  const sectionSlug = String(formData.get("sectionSlug") || "");
  const g = await guard(manualSlug, sectionSlug);
  if ("error" in g) return { error: g.error };

  const res = addHandbookNote({
    manualSlug,
    sectionSlug,
    text: String(formData.get("text") || ""),
    user: g.user,
  });
  if ("error" in res) return { error: res.error };
  revalidatePath(`/handbook/${manualSlug}`);
  return { ok: true };
}

export async function addFileAction(_prev: Result | null, formData: FormData): Promise<Result> {
  const manualSlug = String(formData.get("manualSlug") || "");
  const sectionSlug = String(formData.get("sectionSlug") || "");
  const g = await guard(manualSlug, sectionSlug);
  if ("error" in g) return { error: g.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "請選擇檔案" };
  if (file.size > 10 * 1024 * 1024) return { error: "檔案過大（上限 10MB）" };

  const dataBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const res = addHandbookFile({
    manualSlug,
    sectionSlug,
    fileName: file.name,
    fileMime: file.type,
    dataBase64,
    user: g.user,
  });
  if ("error" in res) return { error: res.error };
  revalidatePath(`/handbook/${manualSlug}`);
  return { ok: true };
}

export async function deleteEntryAction(_prev: Result | null, formData: FormData): Promise<Result> {
  const manualSlug = String(formData.get("manualSlug") || "");
  const id = String(formData.get("id") || "");
  const user = await getCurrentEmployee();
  if (!user) return { error: "請先登入" };

  const res = deleteHandbookEntry(id, user);
  if ("error" in res) return { error: res.error };
  revalidatePath(`/handbook/${manualSlug}`);
  return { ok: true };
}
