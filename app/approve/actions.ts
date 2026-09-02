"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore, getEmployee, pushHistory } from "@/lib/store";

export async function approveAllBulk() {
  const user = await getCurrentEmployee();
  const approverCos = user?.approverCompanyIds || [];
  if (!user || approverCos.length === 0) redirect("/login");
  const { forms } = getStore();
  forms.forEach((f) => {
    if (f.status === "hr_review" && approverCos.includes(getEmployee(f.employeeId)!.companyId)) {
      f.status = "approved";
      f.signatures.approvedAt = new Date().toISOString();
      pushHistory(f, user.name, "董事長批次核決通過");
    }
  });
  revalidatePath("/approve");
  revalidatePath("/hr");
  redirect("/approve");
}
