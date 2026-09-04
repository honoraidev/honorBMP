"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import {
  getForm,
  getEmployee,
  pushHistory,
  STATUS_ORDER,
  addFormAttachment,
  deleteFormAttachment,
} from "@/lib/store";
import { getViewerContext, REJECTABLE_STATUS_SEQUENCE } from "@/lib/permissions";
import { GoalItem, FixedItem, Tier, RankingTier, FormStatus } from "@/lib/types";

function tierOrNull(v: FormDataEntryValue | null): Tier | null {
  if (v === "exceed" || v === "meet" || v === "below") return v;
  return null;
}

async function requireUser() {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  return user!;
}

export async function saveSelf(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const mode = String(formData.get("mode") || "draft");
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canEditSelf) return;

  const goalItems: GoalItem[] = form.goalItems.map((item) => ({
    ...item,
    title: String(formData.get(`goal${item.order}Title`) ?? item.title),
    standardDesc: String(formData.get(`goal${item.order}Desc`) ?? item.standardDesc),
    weight: Number(formData.get(`goal${item.order}Weight`) ?? item.weight) || item.weight,
    selfTier: tierOrNull(formData.get(`goal${item.order}Tier`)),
  }));

  const fixedItems: FixedItem[] = form.fixedItems.map((item) => ({
    ...item,
    selfTier: tierOrNull(formData.get(`fixed_${item.key}_Tier`)),
  }));

  form.goalItems = goalItems;
  form.fixedItems = fixedItems;
  form.selfFeedbackGrowth = String(formData.get("feedbackGrowth") ?? "");
  form.selfFeedbackNextYear = String(formData.get("feedbackNextYear") ?? "");

  // 自訂欄位值：收集以 custom_ 開頭的欄位
  if (!form.customFieldValues) form.customFieldValues = {};
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("custom_")) {
      form.customFieldValues[key.slice(7)] = String(val);
    }
  }

  if (mode === "submit") {
    const weightSum = goalItems.reduce((s, i) => s + i.weight, 0);
    const allTiersFilled = [...goalItems, ...fixedItems].every((i) => i.selfTier);
    if (weightSum !== 75 || !allTiersFilled) {
      // Validation failed — keep as draft, do not advance status.
      revalidatePath(`/form/${formId}`);
      redirect(`/form/${formId}?error=self_incomplete`);
    }
    form.status = "self";
    form.lastStatusChangedAt = new Date().toISOString();
    form.signatures.selfAt = new Date().toISOString();
    pushHistory(form, user.name, "完成自評並送出", `合計目標配分 ${weightSum} 分`);
  } else {
    pushHistory(form, user.name, "儲存自評草稿");
  }

  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}`);
}

export async function savePrimary(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const mode = String(formData.get("mode") || "draft");
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canEditPrimary) return;

  form.goalItems = form.goalItems.map((item) => ({
    ...item,
    primaryTier: tierOrNull(formData.get(`goal${item.order}Tier`)) ?? item.primaryTier,
  }));
  form.fixedItems = form.fixedItems.map((item) => ({
    ...item,
    primaryTier: tierOrNull(formData.get(`fixed_${item.key}_Tier`)) ?? item.primaryTier,
  }));
  form.primaryComment = String(formData.get("primaryComment") ?? form.primaryComment);

  // 初評主管填寫的自訂欄位
  if (!form.customFieldValues) form.customFieldValues = {};
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("custom_")) {
      form.customFieldValues[key.slice(7)] = String(val);
    }
  }

  if (mode === "submit") {
    const allFilled = [...form.goalItems, ...form.fixedItems].every((i) => i.primaryTier);
    if (!allFilled) {
      revalidatePath(`/form/${formId}`);
      redirect(`/form/${formId}?error=primary_incomplete`);
    }
    form.status = "primary";
    form.lastStatusChangedAt = new Date().toISOString();
    form.signatures.primaryAt = new Date().toISOString();
    pushHistory(form, user.name, "完成初評並送出");
  } else {
    pushHistory(form, user.name, "儲存初評草稿");
  }

  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}`);
}

export async function saveSecondary(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const mode = String(formData.get("mode") || "draft");
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canEditSecondary) return;

  const bm = Number(formData.get("bonusMalus"));
  form.bonusMalus = Number.isFinite(bm) ? Math.max(-10, Math.min(10, bm)) : form.bonusMalus;
  form.secondaryComment = String(formData.get("secondaryComment") ?? form.secondaryComment);
  form.secondaryDevAssessment = String(formData.get("secondaryDevAssessment") ?? form.secondaryDevAssessment);
  const rt = String(formData.get("rankingTier") || "");
  if (["T1", "T2", "T3", "T4", "T5"].includes(rt)) form.rankingTier = rt as RankingTier;
  form.rankingOverrideReason = String(formData.get("rankingOverrideReason") ?? form.rankingOverrideReason);

  // 複評主管填寫的自訂欄位
  if (!form.customFieldValues) form.customFieldValues = {};
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("custom_")) {
      form.customFieldValues[key.slice(7)] = String(val);
    }
  }

  if (mode === "submit") {
    if (!form.rankingTier) {
      revalidatePath(`/form/${formId}`);
      redirect(`/form/${formId}?error=secondary_incomplete`);
    }
    form.status = "secondary";
    form.lastStatusChangedAt = new Date().toISOString();
    form.signatures.secondaryAt = new Date().toISOString();
    pushHistory(form, user.name, "完成複評並送出", `排名等第：${form.rankingTier}`);
  } else {
    pushHistory(form, user.name, "儲存複評草稿");
  }

  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}`);
}

/**
 * 退回表單：支援指定目標步驟（跨多步退回）。
 * targetStep hidden input 指定要退回的步驟；若未指定則退回至上一步（向後相容）。
 */
export async function returnStage(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const reason = String(formData.get("reason") || "");
  const targetStepInput = formData.get("targetStep") as FormStatus | null;
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canReturn || !reason.trim()) {
    redirect(`/form/${formId}?error=return_reason_required`);
  }

  const currentIdx = STATUS_ORDER.indexOf(form.status);

  // 確認 targetStep 合法（必須比目前早，且在可退回清單內）
  let targetStep: FormStatus;
  if (
    targetStepInput &&
    REJECTABLE_STATUS_SEQUENCE.includes(targetStepInput) &&
    STATUS_ORDER.indexOf(targetStepInput) < currentIdx
  ) {
    targetStep = targetStepInput;
  } else {
    // 預設退回上一步
    if (currentIdx > 0) {
      targetStep = STATUS_ORDER[currentIdx - 1];
    } else {
      redirect(`/form/${formId}`);
      return;
    }
  }

  form.returnReason = reason;
  form.returnedFromStatus = form.status;
  form.status = targetStep;
  form.lastStatusChangedAt = new Date().toISOString();

  if (!form.rejectHistory) form.rejectHistory = [];
  form.rejectHistory.push({
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    fromStep: form.returnedFromStatus,
    targetStep,
    reason,
  });

  pushHistory(form, user.name, `退回至「${targetStep}」階段`, reason);

  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}`);
}

export async function hrForward(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canHrForward) return;
  form.status = "hr_review";
  form.lastStatusChangedAt = new Date().toISOString();
  pushHistory(form, user.name, "人資彙整完成，送交核決");
  revalidatePath(`/form/${formId}`);
  revalidatePath("/hr");
  redirect(formData.get("back") ? String(formData.get("back")) : `/form/${formId}`);
}

export async function approveForm(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canApprove) return;
  form.status = "approved";
  form.lastStatusChangedAt = new Date().toISOString();
  form.signatures.approvedAt = new Date().toISOString();
  pushHistory(form, user.name, "董事長核決通過");
  revalidatePath(`/form/${formId}`);
  revalidatePath("/approve");
  redirect(formData.get("back") ? String(formData.get("back")) : `/form/${formId}`);
}

/** 主管上傳附件（base64 encoded，限 10MB）。 */
export async function uploadAttachment(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const form = getForm(formId);
  if (!form) redirect(`/form/${formId}?error=form_not_found`);
  const employee = getEmployee(form!.employeeId);
  if (!employee) redirect(`/form/${formId}`);
  const ctx = getViewerContext(user, employee!, form!);
  if (!ctx.canUploadAttachment) redirect(`/form/${formId}?error=no_permission`);

  const fileName = String(formData.get("fileName") || "").trim();
  const fileMime = String(formData.get("fileMime") || "application/octet-stream");
  const fileData = String(formData.get("fileData") || "");
  if (!fileName || !fileData) {
    redirect(`/form/${formId}?error=attachment_invalid`);
  }

  const bytes = Math.floor((fileData.length * 3) / 4);
  if (bytes > 10 * 1024 * 1024) redirect(`/form/${formId}?error=attachment_too_large`);

  const formatBytes = (n: number) => {
    if (n < 1024) return `${n}B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
    return `${(n / 1024 / 1024).toFixed(2)}MB`;
  };

  const id = `att-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  addFormAttachment(formId, {
    id,
    uploaderName: user.name,
    uploaderId: user.id,
    uploadedAtStage: form!.status,
    uploadedAt: new Date().toISOString(),
    fileName,
    fileMime,
    fileSize: formatBytes(bytes),
    fileData,
  });

  pushHistory(form!, user.name, `上傳附件「${fileName}」`);
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}`);
}

/** 刪除附件。 */
export async function removeAttachment(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const attachmentId = String(formData.get("attachmentId"));
  deleteFormAttachment(formId, attachmentId, user.id, !!user.isHrAdmin);
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}`);
}
