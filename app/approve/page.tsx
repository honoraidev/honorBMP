import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore, getEmployee, getCompany, getDepartment, computeTotal } from "@/lib/store";
import { RANKING_LABELS } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { approveAllBulk } from "./actions";

export default async function ApprovePage() {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  const approverCos = user.approverCompanyIds || [];
  if (approverCos.length === 0) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限最終核決角色檢視。</div>;
  }

  const { forms } = getStore();
  const inScope = (f: (typeof forms)[number]) => approverCos.includes(getEmployee(f.employeeId)!.companyId);
  const pending = forms.filter((f) => f.status === "hr_review" && inScope(f));
  const approved = forms.filter((f) => f.status === "approved" && inScope(f));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy">核決中心</h1>
        <p className="text-sm text-gray-500 mt-1">
          待核決 {pending.length} 份・已核決 {approved.length} 份
        </p>
      </div>

      {pending.length > 0 && (
        <form action={approveAllBulk} className="card p-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            人資已彙整 <span className="font-bold text-navy">{pending.length}</span> 份考核表，等候核決。
          </p>
          <button type="submit" className="btn btn-primary">
            批次核准全部 →
          </button>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 font-bold text-navy text-sm">待核決清單</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-4 py-2.5">姓名</th>
              <th className="text-left px-4 py-2.5">部門</th>
              <th className="text-right px-4 py-2.5">分數</th>
              <th className="text-center px-4 py-2.5">等第</th>
              <th className="text-right px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pending.map((f) => {
              const emp = getEmployee(f.employeeId)!;
              const dept = getDepartment(emp.departmentId);
              const co = getCompany(emp.companyId);
              return (
                <tr key={f.id} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 font-medium">{emp.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {approverCos.length > 1 && <span className="text-xs text-gray-400">{co?.name}・</span>}
                    {dept?.name}
                  </td>
                  <td className="px-4 py-2.5 text-right">{computeTotal(f)}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{f.rankingTier ? RANKING_LABELS[f.rankingTier] : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/form/${f.id}`} className="text-navy font-semibold hover:underline">
                      檢視並核決 →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {pending.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  目前沒有待核決的考核表
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 font-bold text-navy text-sm">已核決清單</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-4 py-2.5">姓名</th>
              <th className="text-left px-4 py-2.5">部門</th>
              <th className="text-right px-4 py-2.5">分數</th>
              <th className="text-center px-4 py-2.5">等第</th>
              <th className="text-right px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {approved.map((f) => {
              const emp = getEmployee(f.employeeId)!;
              const dept = getDepartment(emp.departmentId);
              const co = getCompany(emp.companyId);
              return (
                <tr key={f.id} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 font-medium">{emp.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {approverCos.length > 1 && <span className="text-xs text-gray-400">{co?.name}・</span>}
                    {dept?.name}
                  </td>
                  <td className="px-4 py-2.5 text-right">{computeTotal(f)}</td>
                  <td className="px-4 py-2.5 text-center text-xs">{f.rankingTier ? RANKING_LABELS[f.rankingTier] : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/form/${f.id}`} className="text-navy font-semibold hover:underline">
                      檢視 →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {approved.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  尚無已核決紀錄
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
