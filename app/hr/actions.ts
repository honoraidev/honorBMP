"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore, pushHistory, persist } from "@/lib/store";

export async function hrForwardBulk() {
  const user = await getCurrentEmployee();
  if (!user || !user.isHrAdmin) redirect("/login");
  const { forms } = getStore();
  let count = 0;
  forms.forEach((f) => {
    if (f.status === "secondary") {
      f.status = "hr_review";
      pushHistory(f, user.name, "人資批次彙整，送交核決");
      count++;
    }
  });
  revalidatePath("/hr");
  revalidatePath("/approve");
  redirect("/hr");
}

export async function updateCyclePhases(formData: FormData) {
  const user = await getCurrentEmployee();
  if (!user || !user.isHrAdmin) redirect("/login");
  const { cycle } = getStore();
  const fields: (keyof typeof cycle.phases)[] = [
    "announce",
    "selfStart",
    "selfEnd",
    "primaryStart",
    "primaryEnd",
    "secondaryStart",
    "secondaryEnd",
    "hrDeadline",
  ];
  fields.forEach((key) => {
    const v = formData.get(key);
    if (v) cycle.phases[key] = String(v);
  });
  persist();
  revalidatePath("/hr/cycle");
  revalidatePath("/");
  redirect("/hr/cycle?saved=1");
}
