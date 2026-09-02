"use server";

import { revalidatePath } from "next/cache";
import { getCurrentEmployee } from "@/lib/auth";
import { updateEmployeeProfile } from "@/lib/store";

type ActionState = { error?: string; success?: boolean } | null;

const MAX_AVATAR_DATA_URL_LENGTH = 1_500_000; // ~1.1MB decoded, generous ceiling (client already downsizes)

export async function updateAvatar(dataUrl: string): Promise<ActionState> {
  const user = await getCurrentEmployee();
  if (!user) return { error: "請先登入" };
  if (!dataUrl.startsWith("data:image/")) return { error: "圖片格式不支援" };
  if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) return { error: "圖片太大，請換一張較小的圖片" };

  updateEmployeeProfile(user.id, { avatarUrl: dataUrl });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeAvatar(): Promise<ActionState> {
  const user = await getCurrentEmployee();
  if (!user) return { error: "請先登入" };
  updateEmployeeProfile(user.id, { avatarUrl: "" });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function changePassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentEmployee();
  if (!user) return { error: "請先登入" };

  const currentPassword = String(formData.get("currentPassword") || "").trim();
  const newPassword = String(formData.get("newPassword") || "").trim();
  const confirmPassword = String(formData.get("confirmPassword") || "").trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "請完整填寫所有欄位" };
  }
  if ((user.password || "") !== currentPassword) {
    return { error: "目前密碼不正確" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "兩次輸入的新密碼不一致" };
  }
  if (newPassword.length < 1) {
    return { error: "新密碼不可為空" };
  }
  if (newPassword === currentPassword) {
    return { error: "新密碼不可與目前密碼相同" };
  }

  updateEmployeeProfile(user.id, { password: newPassword });
  return { success: true };
}
