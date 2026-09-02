"use server";

import { redirect } from "next/navigation";
import { setCurrentEmployee, clearCurrentEmployee } from "@/lib/auth";
import { verifyCredentials, resetStore } from "@/lib/store";

export async function loginWithCredentials(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!username || !password) {
    return { error: "請輸入工號與密碼" };
  }

  const emp = verifyCredentials(username, password);
  if (!emp) {
    return { error: "工號或密碼錯誤，請重新確認！" };
  }

  await setCurrentEmployee(emp.id);
  redirect("/");
}

export async function logout() {
  await clearCurrentEmployee();
  redirect("/login");
}

export async function resetDemo() {
  resetStore();
  redirect("/");
}

