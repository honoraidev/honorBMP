import { AppraisalForm, Employee, FormStatus } from "./types";
import { getStore } from "./store";

export interface ViewerContext {
  isOwner: boolean;
  isPrimary: boolean;
  isSecondary: boolean;
  isHr: boolean;
  isApprover: boolean;
  /** 部門主管（有任何下屬的人） */
  isDeptManager: boolean;
  canEditSelf: boolean;
  canEditPrimary: boolean;
  canEditSecondary: boolean;
  canHrForward: boolean;
  canApprove: boolean;
  canReturn: boolean;
  canView: boolean;
  /** 可上傳主管附件（初評或複評主管） */
  canUploadAttachment: boolean;
  /** 可客製化題目與配分權重（主管、人資、或自評設定階段之員工） */
  canCustomizeForm: boolean;
}

export function isUserDeptManager(user: Employee): boolean {
  if (user.isHrAdmin) return true;
  const store = getStore();
  return store.employees.some(
    (e) => e.primaryReviewerId === user.id || e.secondaryReviewerId === user.id
  );
}

export function getViewerContext(user: Employee, employee: Employee, form: AppraisalForm): ViewerContext {
  const isOwner = user.id === employee.id;
  const isPrimary = employee.primaryReviewerId === user.id;
  const isSecondary = employee.secondaryReviewerId === user.id;
  const isHr = !!user.isHrAdmin;
  const isApprover = !!user.approverCompanyIds?.includes(employee.companyId);

  // 部門主管：有任何員工以他為初評或複評的人
  const store = getStore();
  const isDeptManager = store.employees.some(
    (e) => e.primaryReviewerId === user.id || e.secondaryReviewerId === user.id
  );

  const canEditSelf = isOwner && form.status === "goal_setting";
  const canEditPrimary = isPrimary && form.status === "self";
  const canEditSecondary = isSecondary && form.status === "primary";
  const canHrForward = isHr && form.status === "secondary";
  const canApprove = isApprover && form.status === "hr_review";

  const canReturn =
    (isPrimary && form.status === "self") ||
    (isSecondary && form.status === "primary") ||
    (isHr && form.status === "secondary") ||
    (isApprover && form.status === "hr_review");

  // 主管（初評、複評）、人資，或是目標設定階段的受評人皆可客製化題目與配分
  const canCustomizeForm =
    isPrimary ||
    isSecondary ||
    isHr ||
    (isOwner && form.status === "goal_setting");

  // 可上傳附件：初評中或複評中，對應的主管可上傳
  const canUploadAttachment =
    (isPrimary && (form.status === "self" || form.status === "primary")) ||
    (isSecondary && (form.status === "primary" || form.status === "secondary")) ||
    isHr;

  // 部門隔離：
  // - 本人 ✅
  // - 初評/複評主管 ✅
  // - isHrAdmin ✅（全部）
  // - isApprover（核決人）→ 看整個公司 ✅
  // - 部門主管 → 只看同部門
  const canView =
    isOwner ||
    isPrimary ||
    isSecondary ||
    isHr ||
    isApprover ||
    (isDeptManager && employee.departmentId === user.departmentId);

  return {
    isOwner,
    isPrimary,
    isSecondary,
    isHr,
    isApprover,
    isDeptManager,
    canEditSelf,
    canEditPrimary,
    canEditSecondary,
    canHrForward,
    canApprove,
    canReturn,
    canView,
    canUploadAttachment,
    canCustomizeForm,
  };
}

/** 用於列表頁篩選：判斷此 user 能否看到某份表單（不需要完整 ViewerContext）。 */
export function canUserViewForm(user: Employee, form: AppraisalForm): boolean {
  if (user.isHrAdmin) return true;
  if (user.id === form.employeeId) return true;

  const store = getStore();
  const employee = store.employees.find((e) => e.id === form.employeeId);
  if (!employee) return false;

  if (employee.primaryReviewerId === user.id) return true;
  if (employee.secondaryReviewerId === user.id) return true;
  if (user.approverCompanyIds?.includes(employee.companyId)) return true;

  // 部門主管：有任何下屬 + 同部門
  const isDeptManager = store.employees.some(
    (e) => e.primaryReviewerId === user.id || e.secondaryReviewerId === user.id
  );
  if (isDeptManager && employee.departmentId === user.departmentId) return true;

  return false;
}

/**
 * 退回時可以選擇的目標步驟列表（只能退到比現在更早的步驟）。
 * 不包含 goal_setting 以前和 approved（不可退回已核決）。
 */
export const REJECTABLE_STATUS_SEQUENCE: FormStatus[] = [
  "goal_setting",
  "self",
  "primary",
  "secondary",
  "hr_review",
];

export const STATUS_REJECT_LABEL: Record<FormStatus, string> = {
  goal_setting: "退回至「目標設定/自評」（員工重填）",
  self: "退回至「初評中」（初評主管修正）",
  primary: "退回至「複評中」（複評主管修正）",
  secondary: "退回至「待人資彙整」",
  hr_review: "退回至「待核決」",
  approved: "已核決",
  returned: "已退回",
};
