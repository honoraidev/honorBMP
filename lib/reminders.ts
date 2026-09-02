import { Employee } from "./types";
import {
  getStore,
  getFormByEmployee,
  formsAsPrimary,
  formsAsSecondary,
  allForms,
} from "./store";
import type { Reminder, ReminderLevel } from "./reminder-types";

export type { Reminder, ReminderLevel } from "./reminder-types";
export { reminderCountLabel } from "./reminder-types";

function startOfToday(): number {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
}

function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const due = new Date(y, (m || 1) - 1, d || 1).getTime();
  return Math.round((due - startOfToday()) / 86_400_000);
}

function levelFor(daysLeft: number): ReminderLevel {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 3) return "due_soon";
  return "upcoming";
}

/** 依使用者角色與目前考核表狀態，算出「待辦 + 到期」提醒清單。 */
export function getRemindersForUser(user: Employee): Reminder[] {
  const { cycle } = getStore();
  if (cycle.status !== "active") return [];
  const p = cycle.phases;
  const out: Reminder[] = [];

  const push = (id: string, title: string, detail: string, href: string, dueDate: string) => {
    const daysLeft = daysUntil(dueDate);
    out.push({ id, level: levelFor(daysLeft), title, detail, href, dueDate, daysLeft });
  };

  // 本人自評
  const myForm = getFormByEmployee(user.id);
  if (myForm && myForm.status === "goal_setting") {
    push("self", "完成自評", "請填寫本年度自評並送交初評主管。", `/form/${myForm.id}`, p.selfEnd);
  }
  if (myForm && myForm.status === "returned") {
    push("returned", "考核表已被退回", "請依退回原因修正後重新送出。", `/form/${myForm.id}`, p.selfEnd);
  }

  // 初評主管
  const pendingPrimary = formsAsPrimary(user.id).filter((f) => f.status === "self");
  if (pendingPrimary.length > 0) {
    push(
      "primary",
      `待初評 ${pendingPrimary.length} 份`,
      "有下屬考核表等待您初評。",
      "/review?role=primary",
      p.primaryEnd
    );
  }

  // 複評主管
  const pendingSecondary = formsAsSecondary(user.id).filter((f) => f.status === "primary");
  if (pendingSecondary.length > 0) {
    push(
      "secondary",
      `待複評 ${pendingSecondary.length} 份`,
      "有考核表等待您複評與排名。",
      "/review?role=secondary",
      p.secondaryEnd
    );
  }

  // 人資彙整
  if (user.isHrAdmin) {
    const readyToForward = allForms().filter((f) => f.status === "secondary");
    if (readyToForward.length > 0) {
      push(
        "hr",
        `待彙整 ${readyToForward.length} 份`,
        "複評完成的考核表可彙整送董事長核決。",
        "/hr",
        p.hrDeadline
      );
    }
  }

  // 核決
  if (user.approverCompanyIds?.length) {
    const pendingApprove = allForms().filter(
      (f) =>
        f.status === "hr_review" &&
        user.approverCompanyIds!.includes(
          getStore().employees.find((e) => e.id === f.employeeId)?.companyId ?? ""
        )
    );
    if (pendingApprove.length > 0) {
      push(
        "approve",
        `待核決 ${pendingApprove.length} 份`,
        "人資已彙整，等待您核決。",
        "/approve",
        p.hrDeadline
      );
    }
  }

  const rank: Record<ReminderLevel, number> = { overdue: 0, due_soon: 1, upcoming: 2 };
  return out.sort((a, b) => rank[a.level] - rank[b.level] || a.daysLeft - b.daysLeft);
}
