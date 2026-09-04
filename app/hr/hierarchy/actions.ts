"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { upsertDeptReviewConfig, updateEmployeeReviewers } from "@/lib/store";
import { DepartmentReviewConfig } from "@/lib/types";

async function requireHr() {
  const user = await getCurrentEmployee();
  if (!user || !user.isHrAdmin) redirect("/login");
  return user!;
}

export async function saveDeptConfig(formData: FormData) {
  const user = await requireHr();
  const departmentId = String(formData.get("departmentId") || "");
  if (!departmentId) redirect("/hr/hierarchy?error=dept_required");

  const config: DepartmentReviewConfig = {
    departmentId,
    defaultPrimaryReviewerId: String(formData.get("primaryReviewerId") || "") || null,
    defaultSecondaryReviewerId: String(formData.get("secondaryReviewerId") || "") || null,
    updatedBy: user.name,
    updatedAt: new Date().toISOString(),
  };

  upsertDeptReviewConfig(config);
  revalidatePath("/hr/hierarchy");
  redirect("/hr/hierarchy?saved=dept");
}

export async function savePersonalReviewer(formData: FormData) {
  const user = await requireHr();
  const employeeId = String(formData.get("employeeId") || "");
  if (!employeeId) redirect("/hr/hierarchy?error=emp_required");

  const primaryId = String(formData.get("primaryReviewerId") || "") || null;
  const secondaryId = String(formData.get("secondaryReviewerId") || "") || null;

  const result = updateEmployeeReviewers(employeeId, primaryId, secondaryId);
  if ("error" in result) redirect(`/hr/hierarchy?error=${encodeURIComponent(result.error)}`);

  revalidatePath("/hr/hierarchy");
  redirect("/hr/hierarchy?saved=personal");
}
