"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { createEmployee, deleteEmployee } from "@/lib/store";

async function requireHr() {
  const user = await getCurrentEmployee();
  if (!user || !user.isHrAdmin) redirect("/login");
  return user!;
}

export async function createEmployeeAction(formData: FormData) {
  await requireHr();

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

export async function deleteEmployeeAction(formData: FormData) {
  await requireHr();

  const id = String(formData.get("employeeId") || "");
  if (!id) redirect("/hr/employees?error=invalid");

  const result = deleteEmployee(id);
  if ("error" in result) {
    redirect(`/hr/employees?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/hr/employees");
  revalidatePath("/hr");
  revalidatePath("/");
  redirect("/hr/employees?deleted=1");
}

export async function batchImportEmployeesAction(formData: FormData) {
  await requireHr();

  const rawText = String(formData.get("importData") || "").trim();
  if (!rawText) {
    redirect("/hr/employees?error=" + encodeURIComponent("請輸入要匯入的人員資料"));
  }

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let successCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignore header if present
    if (i === 0 && (line.includes("姓名") || line.includes("工號") || line.includes("name"))) {
      continue;
    }

    // Split by comma or tab
    const parts = line.includes("\t") ? line.split("\t") : line.split(",");
    const trimmed = parts.map((p) => p.trim().replace(/^["']|["']$/g, ""));

    if (trimmed.length < 4) {
      errors.push(`第 ${i + 1} 行格式不符（至少需要：姓名, 工號, 職稱, 部門代碼或名稱）：${line}`);
      continue;
    }

    const [name, employeeNo, title, deptStr, primaryStr, secondaryStr, isHrStr] = trimmed;
    
    // Resolve department
    const store = (await import("@/lib/store")).getStore();
    const dept = store.departments.find(
      (d) => d.id === deptStr || d.name === deptStr || d.name.includes(deptStr)
    );

    if (!dept) {
      errors.push(`第 ${i + 1} 行「${name}」找不到對應部門「${deptStr}」`);
      continue;
    }

    // Resolve reviewers if specified
    const findReviewer = (str?: string) => {
      if (!str) return null;
      const found = store.employees.find((e) => e.id === str || e.name === str || e.employeeNo === str);
      return found ? found.id : null;
    };

    const res = createEmployee({
      name,
      employeeNo,
      title,
      departmentId: dept.id,
      primaryReviewerId: findReviewer(primaryStr),
      secondaryReviewerId: findReviewer(secondaryStr),
      isHrAdmin: isHrStr === "true" || isHrStr === "1" || isHrStr === "是" || isHrStr === "人資",
    });

    if ("error" in res) {
      errors.push(`第 ${i + 1} 行「${name}」匯入失敗：${res.error}`);
    } else {
      successCount++;
    }
  }

  revalidatePath("/hr/employees");
  revalidatePath("/hr");
  revalidatePath("/");

  if (errors.length > 0 && successCount === 0) {
    redirect(`/hr/employees?error=${encodeURIComponent(errors.slice(0, 3).join("；"))}`);
  } else if (errors.length > 0) {
    redirect(`/hr/employees?imported=${successCount}&error=${encodeURIComponent(errors.slice(0, 2).join("；"))}`);
  } else {
    redirect(`/hr/employees?imported=${successCount}`);
  }
}

