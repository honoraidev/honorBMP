import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import {
  getStore,
  getEmployee,
  getDepartment,
  getCompany,
  computeTotal,
  tierCounts,
  departmentEmployeeCount,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/store";
import { RANKING_TARGET_PCT, RankingTier } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { hrForwardBulk } from "./actions";
import { resetDemo } from "@/app/login/actions";

const TIERS: RankingTier[] = ["T1", "T2", "T3", "T4", "T5"];

export default async function HrDashboardPage() {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  if (!user.isHrAdmin) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限人資角色檢視。</div>;
  }

  const { forms, departments, cycle } = getStore();

  const statusCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = forms.filter((f) => f.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const readyToForward = forms.filter((f) => f.status === "secondary");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">人資彙整看板</h1>
          <p className="text-sm text-gray-500 mt-1">{cycle.label}・共 {forms.length} 份考核表</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/hr/employees" className="btn btn-outline">
            人員管理
          </Link>
          <Link href="/hr/hierarchy" className="btn btn-outline">
            層級設定
          </Link>
          <Link href="/hr/templates" className="btn btn-outline">
            表單模板
          </Link>
          <Link href="/hr/cycle" className="btn btn-outline">
            考核週期設定
          </Link>
          <form action={resetDemo}>
            <button type="submit" className="btn btn-outline !text-red-600 !border-red-200">
              重置示範資料
            </button>
          </form>
        </div>
      </div>

      {/* Progress overview */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">全體進度總覽</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-navy">{statusCounts[s]}</div>
              <div className="text-xs text-gray-500 mt-1">{STATUS_LABEL[s]}</div>
            </div>
          ))}
        </div>
      </div>

      {readyToForward.length > 0 && (
        <form action={hrForwardBulk} className="card p-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            共 <span className="font-bold text-navy">{readyToForward.length}</span> 份考核表已完成複評，可批次彙整送交董事長核決。
          </p>
          <button type="submit" className="btn btn-teal">
            批次彙整送核決 →
          </button>
        </form>
      )}

      {/* Ranking distribution audit */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-1">等第分佈稽核</h2>
        <p className="text-xs text-gray-400 mb-4">常態分配目標：等第一 5%／等第二 15%／等第三 65%／等第四 10%／等第五 5%</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">公司</th>
                <th className="text-left px-3 py-2">部門</th>
                <th className="text-center px-3 py-2">人數</th>
                {TIERS.map((t) => (
                  <th key={t} className="text-center px-3 py-2">
                    {t}（{RANKING_TARGET_PCT[t]}%）
                  </th>
                ))}
                <th className="text-center px-3 py-2">狀態</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => {
                const deptForms = forms.filter((f) => getEmployee(f.employeeId)?.departmentId === d.id);
                const total = departmentEmployeeCount(d.id);
                const counts = tierCounts(deptForms);
                const relaxed = total < 4;
                const rankedCount = TIERS.reduce((s, t) => s + counts[t], 0);
                const complete = rankedCount === total;
                const co = getCompany(d.companyId);
                return (
                  <tr key={d.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{co?.name}</td>
                    <td className="px-3 py-2 font-medium">{d.name}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{total}</td>
                    {TIERS.map((t) => (
                      <td key={t} className="px-3 py-2 text-center">
                        {counts[t]}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center">
                      {relaxed ? (
                        <span className="badge bg-gray-100 text-gray-500">人數&lt;4人・放寬</span>
                      ) : complete ? (
                        <span className="badge bg-green-100 text-green-700">已全數核定</span>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-700">
                          {rankedCount}/{total} 已核定
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full roster table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy">全體考核表清單</h2>
          <a href="/hr/export" className="btn btn-outline text-xs">
            匯出 CSV
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">姓名</th>
                <th className="text-left px-3 py-2">公司</th>
                <th className="text-left px-3 py-2">部門</th>
                <th className="text-left px-3 py-2">狀態</th>
                <th className="text-right px-3 py-2">分數</th>
                <th className="text-center px-3 py-2">等第</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => {
                const emp = getEmployee(f.employeeId)!;
                const dept = getDepartment(emp.departmentId);
                const co = getCompany(emp.companyId);
                return (
                  <tr key={f.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-medium">{emp.name}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{co?.name}</td>
                    <td className="px-3 py-2 text-gray-500">{dept?.name}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-3 py-2 text-right">{computeTotal(f)}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{f.rankingTier || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/form/${f.id}`} className="text-navy font-semibold hover:underline text-xs">
                          檢視 →
                        </Link>
                        <a href={`/api/form/${f.id}/pdf`} target="_blank" className="text-gray-400 hover:text-navy text-xs">
                          PDF
                        </a>
                        <a href={`/api/form/${f.id}/docx`} className="text-gray-400 hover:text-navy text-xs">
                          Word
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
