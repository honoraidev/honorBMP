"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { upsertTemplate, deleteTemplate, getTemplate } from "@/lib/store";
import { isUserDeptManager } from "@/lib/permissions";
import { FormTemplate, CustomFieldDef, CustomFieldType, CustomFieldStage } from "@/lib/types";

async function requireManagerOrHr() {
  const user = await getCurrentEmployee();
  if (!user || (!user.isHrAdmin && !isUserDeptManager(user))) redirect("/login");
  return user!;
}

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export async function createTemplate(formData: FormData) {
  const user = await requireManagerOrHr();
  const now = new Date().toISOString();

  // If department manager (not HR), default company/department to their own if not specified
  let departmentId = String(formData.get("departmentId") || "") || undefined;
  let companyId = String(formData.get("companyId") || "") || undefined;
  if (!user.isHrAdmin && !departmentId) {
    departmentId = user.departmentId;
    companyId = user.companyId;
  }

  const template: FormTemplate = {
    id: genId("tpl"),
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || undefined,
    companyId,
    departmentId,
    fields: [],
    createdBy: user.name,
    createdAt: now,
    updatedAt: now,
  };

  if (!template.name) redirect("/hr/templates?error=name_required");
  upsertTemplate(template);
  revalidatePath("/hr/templates");
  redirect(`/hr/templates/${template.id}`);
}

export async function deleteTemplateAction(formData: FormData) {
  await requireManagerOrHr();
  const id = String(formData.get("templateId"));
  deleteTemplate(id);
  revalidatePath("/hr/templates");
  redirect("/hr/templates");
}

export async function addField(formData: FormData) {
  await requireManagerOrHr();
  const templateId = String(formData.get("templateId"));
  const template = getTemplate(templateId);
  if (!template) redirect("/hr/templates");

  const type = String(formData.get("type") || "text") as CustomFieldType;
  const maxScore = type === "score" || type === "number" ? Number(formData.get("maxScore") || 10) : undefined;
  const optionsRaw = String(formData.get("options") || "");
  const options = optionsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const field: CustomFieldDef = {
    id: genId("fld"),
    label: String(formData.get("label") || "").trim(),
    type,
    required: formData.get("required") === "true",
    targetStage: String(formData.get("targetStage") || "self") as CustomFieldStage,
    maxScore,
    options: ["select", "radio"].includes(type) ? options : undefined,
    hint: String(formData.get("hint") || "").trim() || undefined,
    order: template.fields.length + 1,
  };

  if (!field.label) redirect(`/hr/templates/${templateId}?error=label_required`);

  template.fields.push(field);
  template.updatedAt = new Date().toISOString();
  upsertTemplate(template);
  revalidatePath(`/hr/templates/${templateId}`);
  redirect(`/hr/templates/${templateId}`);
}

export async function deleteField(formData: FormData) {
  await requireManagerOrHr();
  const templateId = String(formData.get("templateId"));
  const fieldId = String(formData.get("fieldId"));
  const template = getTemplate(templateId);
  if (!template) redirect("/hr/templates");
  template.fields = template.fields.filter((f) => f.id !== fieldId).map((f, i) => ({ ...f, order: i + 1 }));
  template.updatedAt = new Date().toISOString();
  upsertTemplate(template);
  revalidatePath(`/hr/templates/${templateId}`);
  redirect(`/hr/templates/${templateId}`);
}
