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

export default async function HomePage() {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");

  const { cycle } = getStore();
  const dept = getDepartment(user.departmentId);
  const company = getCompany(user.companyId);
  const myForm = getFormByEmployee(user.id);
  const primary = formsAsPrimary(user.id);
  const secondary = formsAsSecondary(user.id);

  return (
    <div className="space-y-6">
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
