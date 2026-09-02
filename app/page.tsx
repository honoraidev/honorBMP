import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentEmployee } from "@/lib/auth";
import {
  getStore,
  getFormByEmployee,
  formsAsPrimary,
  formsAsSecondary,
  getDepartment,
  getCompany,
  STATUS_LABEL,
} from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";
import { getRemindersForUser, reminderCountLabel } from "@/lib/reminders";

export default async function HomePage() {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");

  const { cycle } = getStore();
  const dept = getDepartment(user.departmentId);
  const company = getCompany(user.companyId);
  const myForm = getFormByEmployee(user.id);
  const primary = formsAsPrimary(user.id);
  const secondary = formsAsSecondary(user.id);
  const reminders = getRemindersForUser(user);
  const topLevel = reminders.some((r) => r.level === "overdue")
    ? "overdue"
    : reminders.some((r) => r.level === "due_soon")
    ? "due_soon"
    : "upcoming";

  return (
    <div className="space-y-6">
      {reminders.length > 0 && (
        <div
          className={`card p-5 border-l-4 ${
            topLevel === "overdue"
              ? "border-l-red-500"
              : topLevel === "due_soon"
              ? "border-l-amber-500"
              : "border-l-teal"
          }`}
        >
          <h2 className="font-bold text-navy mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-teal" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            考核待辦提醒（{reminders.length}）
          </h2>
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span
                  className={`badge ${
                    r.level === "overdue"
                      ? "bg-red-100 text-red-700"
                      : r.level === "due_soon"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-teal/10 text-teal"
                  }`}
                >
                  {reminderCountLabel(r.daysLeft)}
                </span>
                <span className="font-semibold">{r.title}</span>
                <span className="text-gray-500">{r.detail}</span>
                <span className="text-xs text-gray-400">截止 {r.dueDate}</span>
                <Link href={r.href} className="text-navy font-semibold hover:underline text-xs ml-auto">
                  前往處理 →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="card relative overflow-hidden p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-teal to-navy" />
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-navy">{cycle.label}</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            您好，{user.name}（{user.title}・{company?.name}・{dept?.name}）
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="badge bg-teal/10 text-teal ring-1 ring-teal/20">公告 {cycle.phases.announce}</span>
          <span className="badge bg-teal/10 text-teal ring-1 ring-teal/20">自評至 {cycle.phases.selfEnd}</span>
          <span className="badge bg-teal/10 text-teal ring-1 ring-teal/20">複評至 {cycle.phases.secondaryEnd}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {myForm && (
          <div className="card card-hover p-5">
            <h2 className="font-bold mb-1">我的考核表</h2>
            <p className="text-xs text-gray-500 mb-3">自評與意見回饋，完成後送交初評主管。</p>
            <div className="flex items-center justify-between">
              <StatusBadge status={myForm.status} />
              <Link href={`/form/${myForm.id}`} className="btn btn-primary">
                前往填寫 →
              </Link>
            </div>
          </div>
        )}

        {primary.length > 0 && (
          <div className="card card-hover p-5">
            <h2 className="font-bold mb-1">待我初評</h2>
            <p className="text-xs text-gray-500 mb-3">
              共 {primary.length} 位下屬，{primary.filter((f) => f.status === "self").length} 位待處理。
            </p>
            <Link href="/review?role=primary" className="btn btn-teal">
              前往評核 →
            </Link>
          </div>
        )}

        {secondary.length > 0 && (
          <div className="card card-hover p-5">
            <h2 className="font-bold mb-1">待我複評</h2>
            <p className="text-xs text-gray-500 mb-3">
              共 {secondary.length} 位人員，{secondary.filter((f) => f.status === "primary").length} 位待處理。
            </p>
            <Link href="/review?role=secondary" className="btn btn-teal">
              前往評核 →
            </Link>
          </div>
        )}

        {user.isHrAdmin && (
          <div className="card card-hover p-5">
            <h2 className="font-bold mb-1">人資彙整看板</h2>
            <p className="text-xs text-gray-500 mb-3">全體進度總覽、逾期與等第分佈稽核、考核週期設定。</p>
            <Link href="/hr" className="btn btn-outline">
              前往看板 →
            </Link>
          </div>
        )}

        {!!user.approverCompanyIds?.length && (
          <div className="card card-hover p-5">
            <h2 className="font-bold mb-1">核決中心</h2>
            <p className="text-xs text-gray-500 mb-3">檢視人資彙整後之考核總表，逐筆／批次核准。</p>
            <Link href="/approve" className="btn btn-outline">
              前往核決 →
            </Link>
          </div>
        )}
      </div>

      {myForm && (
        <div className="card p-5 text-xs text-gray-500">
          目前狀態：<span className="font-semibold text-gray-700">{STATUS_LABEL[myForm.status]}</span>
          {myForm.status === "returned" && myForm.returnReason && (
            <span className="text-red-600 ml-2">（退回原因：{myForm.returnReason}）</span>
          )}
        </div>
      )}
    </div>
  );
}
