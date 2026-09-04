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

/** 主管/人資客製化表單目標題目與配分 */
export async function updateGoalItemsAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canCustomizeForm) return;

  const newGoalItems: GoalItem[] = form.goalItems.map((item) => {
    const title = String(formData.get(`goal_${item.order}_title`) ?? item.title);
    const standardDesc = String(formData.get(`goal_${item.order}_desc`) ?? item.standardDesc);
    const weightRaw = formData.get(`goal_${item.order}_weight`);
    const weight = weightRaw !== null ? Math.max(1, Number(weightRaw) || item.weight) : item.weight;
    return {
      ...item,
      title,
      standardDesc,
      weight,
    };
  });

  form.goalItems = newGoalItems;
  pushHistory(form, user.name, "客製化調整目標題目與配分");
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}?customized=1`);
}

/** 主管/人資新增目標題目 */
export async function addGoalItemAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canCustomizeForm) return;

  const title = String(formData.get("title") || "").trim();
  const standardDesc = String(formData.get("standardDesc") || "").trim();
  const weight = Number(formData.get("weight") || 15);

  const nextOrder = form.goalItems.length + 1;
  form.goalItems.push({
    order: nextOrder,
    title,
    standardDesc,
    weight,
    selfTier: null,
    primaryTier: null,
  });

  pushHistory(form, user.name, `新增目標題目第 ${nextOrder} 項「${title || "未命名"}」（配分 ${weight} 分）`);
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}?customized=1`);
}

/** 主管/人資刪除目標題目 */
export async function deleteGoalItemAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const order = Number(formData.get("order"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canCustomizeForm) return;

  if (form.goalItems.length <= 1) {
    redirect(`/form/${formId}?error=cannot_delete_all_goals`);
  }

  form.goalItems = form.goalItems
    .filter((g) => g.order !== order)
    .map((g, idx) => ({ ...g, order: idx + 1 }));

  pushHistory(form, user.name, `刪除目標題目第 ${order} 項並重編排序`);
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}?customized=1`);
}

/** 主管/人資直接修訂原始表單（包含目標題目、行為指標、員工自評等第與回饋內容） */
export async function managerModifyOriginalFormAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);

  // 權限：初評主管、複評主管、人資管理員均可修訂
  if (!ctx.isPrimary && !ctx.isSecondary && !ctx.isHr) {
    redirect(`/form/${formId}?error=no_permission`);
  }

  // 1. 修訂目標項目 (Goal Items)
  form.goalItems = form.goalItems.map((item) => {
    const title = String(formData.get(`goal_${item.order}_title`) ?? item.title);
    const standardDesc = String(formData.get(`goal_${item.order}_desc`) ?? item.standardDesc);
    const weightRaw = formData.get(`goal_${item.order}_weight`);
    const weight = weightRaw !== null ? Math.max(1, Number(weightRaw) || item.weight) : item.weight;
    const selfTier = tierOrNull(formData.get(`goal_${item.order}_selfTier`)) ?? item.selfTier;
    const primaryTier = tierOrNull(formData.get(`goal_${item.order}_primaryTier`)) ?? item.primaryTier;
    return {
      ...item,
      title,
      standardDesc,
      weight,
      selfTier,
      primaryTier,
    };
  });

  // 2. 修訂行為項目 (Fixed Items)
  form.fixedItems = form.fixedItems.map((item) => {
    const label = String(formData.get(`fixed_${item.key}_label`) ?? item.label);
    const weightRaw = formData.get(`fixed_${item.key}_weight`);
    const weight = weightRaw !== null ? Math.max(1, Number(weightRaw) || item.weight) : item.weight;
    const selfTier = tierOrNull(formData.get(`fixed_${item.key}_selfTier`)) ?? item.selfTier;
    const primaryTier = tierOrNull(formData.get(`fixed_${item.key}_primaryTier`)) ?? item.primaryTier;
    return {
      ...item,
      label,
      weight,
      selfTier,
      primaryTier,
    };
  });

  // 3. 修訂員工回饋文字
  if (formData.has("selfFeedbackGrowth")) {
    form.selfFeedbackGrowth = String(formData.get("selfFeedbackGrowth") || "");
  }
  if (formData.has("selfFeedbackNextYear")) {
    form.selfFeedbackNextYear = String(formData.get("selfFeedbackNextYear") || "");
  }

  // 4. 修訂主管意見
  if (formData.has("primaryComment")) {
    form.primaryComment = String(formData.get("primaryComment") || "");
  }
  if (formData.has("secondaryComment")) {
    form.secondaryComment = String(formData.get("secondaryComment") || "");
  }
  if (formData.has("secondaryDevAssessment")) {
    form.secondaryDevAssessment = String(formData.get("secondaryDevAssessment") || "");
  }

  const note = String(formData.get("modifyNote") || "主管修訂原始表單內容");
  pushHistory(form, user.name, "主管修訂原始表單", note);
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}?customized=2`);
}

/** 主管/人資新增行為項目 */
export async function addFixedItemAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.isPrimary && !ctx.isSecondary && !ctx.isHr) return;

  const label = String(formData.get("label") || "").trim();
  const weight = Number(formData.get("weight") || 5);
  const key = `custom_bhv_${Date.now().toString(36)}`;

  form.fixedItems.push({
    key,
    label,
    weight,
    selfTier: null,
    primaryTier: null,
  });

  pushHistory(form, user.name, `新增行為指標項目「${label}」（配分 ${weight} 分）`);
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}?customized=2`);
}

/** 主管/人資刪除行為項目 */
export async function deleteFixedItemAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const key = String(formData.get("key"));
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.isPrimary && !ctx.isSecondary && !ctx.isHr) return;

  if (form.fixedItems.length <= 1) {
    redirect(`/form/${formId}?error=cannot_delete_all_fixed`);
  }

  form.fixedItems = form.fixedItems.filter((f) => f.key !== key);
  pushHistory(form, user.name, `刪除行為指標項目`);
  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}?customized=2`);
}

/** 主管套用既有範本到該表單 */
export async function applyTemplateToFormAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const templateId = String(formData.get("templateId"));
  if (!formId || !templateId) {
    redirect(`/form/${formId}?error=template_invalid`);
  }

  const { applyTemplateToForm } = await import("@/lib/store");
  const res = applyTemplateToForm(formId, templateId, user.name);
  if ("error" in res) {
    redirect(`/form/${formId}?error=${encodeURIComponent(res.error)}`);
  }

  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}?customized=template_applied`);
}

/** 主管將當前表單題目與配分另存為新範本 */
export async function saveFormAsTemplateAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const templateName = String(formData.get("templateName") || "").trim();
  const scope = String(formData.get("scope") || "dept");

  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;

  const companyId = scope === "dept" || scope === "company" ? employee.companyId : undefined;
  const departmentId = scope === "dept" ? employee.departmentId : undefined;

  const { saveFormAsTemplate } = await import("@/lib/store");
  const res = saveFormAsTemplate(formId, templateName, user.name, companyId, departmentId);
  if ("error" in res) {
    redirect(`/form/${formId}?error=${encodeURIComponent(res.error)}`);
  }

  revalidatePath(`/form/${formId}`);
  revalidatePath(`/hr/templates`);
  redirect(`/form/${formId}?customized=template_saved`);
}

/** 主管確認設定並正式派發表單給員工 */
export async function dispatchFormAction(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const { dispatchForm } = await import("@/lib/store");
  const res = dispatchForm(formId, user.name);
  if ("error" in res) {
    redirect(`/form/${formId}?error=${encodeURIComponent(res.error)}`);
  }

  revalidatePath(`/form/${formId}`);
  revalidatePath(`/`);
  redirect(`/form/${formId}?dispatched=1`);
}

/** 主管批次套用範本並派發給多位部屬 */
export async function batchDispatchFormsAction(formData: FormData) {
  const user = await requireUser();
  const templateId = String(formData.get("templateId") || "");
  const formIds = formData.getAll("formIds").map(String).filter(Boolean);

  if (formIds.length === 0) {
    redirect(`/hr/templates?error=no_employees_selected`);
  }

  const { batchDispatchForms } = await import("@/lib/store");
  const { count } = batchDispatchForms(templateId, formIds, user.name);

  revalidatePath(`/hr/templates`);
  revalidatePath(`/review`);
  revalidatePath(`/`);
  redirect(`/hr/templates?dispatchedCount=${count}`);
}



