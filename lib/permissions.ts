import { AppraisalForm, Employee } from "./types";

export interface ViewerContext {
  isOwner: boolean;
  isPrimary: boolean;
  isSecondary: boolean;
  isHr: boolean;
  isApprover: boolean;
  canEditSelf: boolean;
  canEditPrimary: boolean;
  canEditSecondary: boolean;
  canHrForward: boolean;
  canApprove: boolean;
  canReturn: boolean;
  canView: boolean;
}

export function getViewerContext(user: Employee, employee: Employee, form: AppraisalForm): ViewerContext {
  const isOwner = user.id === employee.id;
  const isPrimary = employee.primaryReviewerId === user.id;
  const isSecondary = employee.secondaryReviewerId === user.id;
  const isHr = !!user.isHrAdmin;
  const isApprover = !!user.approverCompanyIds?.includes(employee.companyId);

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

  const canView = isOwner || isPrimary || isSecondary || isHr || isApprover;

  return {
    isOwner,
    isPrimary,
    isSecondary,
    isHr,
    isApprover,
    canEditSelf,
    canEditPrimary,
    canEditSecondary,
    canHrForward,
    canApprove,
    canReturn,
    canView,
  };
}
