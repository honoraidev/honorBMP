"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getForm, getEmployee, pushHistory, STATUS_ORDER } from "@/lib/store";
import { getViewerContext } from "@/lib/permissions";
import { GoalItem, FixedItem, Tier, RankingTier } from "@/lib/types";

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

  if (mode === "submit") {
    const weightSum = goalItems.reduce((s, i) => s + i.weight, 0);
    const allTiersFilled = [...goalItems, ...fixedItems].every((i) => i.selfTier);
    if (weightSum !== 75 || !allTiersFilled) {
      // Validation failed — keep as draft, do not advance status.
      revalidatePath(`/form/${formId}`);
      redirect(`/form/${formId}?error=self_incomplete`);
    }
    form.status = "self";
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

  if (mode === "submit") {
    const allFilled = [...form.goalItems, ...form.fixedItems].every((i) => i.primaryTier);
    if (!allFilled) {
      revalidatePath(`/form/${formId}`);
      redirect(`/form/${formId}?error=primary_incomplete`);
    }
    form.status = "primary";
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

  if (mode === "submit") {
    if (!form.rankingTier) {
      revalidatePath(`/form/${formId}`);
      redirect(`/form/${formId}?error=secondary_incomplete`);
    }
    form.status = "secondary";
    form.signatures.secondaryAt = new Date().toISOString();
    pushHistory(form, user.name, "完成複評並送出", `排名等第：${form.rankingTier}`);
  } else {
    pushHistory(form, user.name, "儲存複評草稿");
  }

  revalidatePath(`/form/${formId}`);
  redirect(`/form/${formId}`);
}

export async function returnStage(formData: FormData) {
  const user = await requireUser();
  const formId = String(formData.get("formId"));
  const reason = String(formData.get("reason") || "");
  const form = getForm(formId);
  if (!form) return;
  const employee = getEmployee(form.employeeId);
  if (!employee) return;
  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canReturn || !reason.trim()) {
    redirect(`/form/${formId}?error=return_reason_required`);
  }
  const idx = STATUS_ORDER.indexOf(form.status);
  if (idx > 0) {
    const prev = STATUS_ORDER[idx - 1];
    form.returnReason = reason;
    form.returnedFromStatus = form.status;
    form.status = prev;
    pushHistory(form, user.name, `退回至「${prev}」階段`, reason);
  }
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
  form.signatures.approvedAt = new Date().toISOString();
  pushHistory(form, user.name, "董事長核決通過");
  revalidatePath(`/form/${formId}`);
  revalidatePath("/approve");
  redirect(formData.get("back") ? String(formData.get("back")) : `/form/${formId}`);
}
