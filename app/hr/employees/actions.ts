"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { createEmployee } from "@/lib/store";

export async function createEmployeeAction(formData: FormData) {
  const user = await getCurrentEmployee();
  if (!user || !user.isHrAdmin) redirect("/login");

  const approverCompanyIds = formData.getAll("approverCompanyIds").map(String).filter(Boolean);

  const res = createEmployee({
    name: String(formData.get("name") || ""),
    employeeNo: String(formData.get("employeeNo") || ""),
    title: String(formData.get("title") || ""),
    departmentId: String(formData.get("departmentId") || ""),
    primaryReviewerId: String(formData.get("primaryReviewerId") || "") || null,
    secondaryReviewerId: String(formData.get("secondaryReviewerId") || "") || null,
    isHrAdmin: formData.get("isHrAdmin") === "on",
    approverCompanyIds,
    password: String(formData.get("password") || ""),
  });

  if ("error" in res) {
    redirect(`/hr/employees?error=${encodeURIComponent(res.error)}`);
  }

  revalidatePath("/hr/employees");
  revalidatePath("/hr");
  revalidatePath("/");
  redirect(`/hr/employees?created=${encodeURIComponent(res.employee.name)}`);
}
