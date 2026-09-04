import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore, getDeptReviewConfigs, getDeptReviewConfig } from "@/lib/store";
import { saveDeptConfig, savePersonalReviewer } from "./actions";

export default async function HierarchyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  if (!user.isHrAdmin) return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限表單管理員檢視。</div>;

  const { saved, error } = await searchParams;
  const { companies, departments, employees } = getStore();
  const configs = getDeptReviewConfigs();

  // 取得所有可當主管的人（有初評/複評關係或 HR/approver）
  const potentialReviewers = employees;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">簽核層級設定</h1>
          <p className="text-sm text-gray-500 mt-1">設定各部門預設初評/複評主管，並可對個人進行特殊層級覆寫</p>
        </div>
        <Link href="/hr" className="btn btn-outline text-sm">← 返回人資看板</Link>
      </div>

      {saved === "dept" && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">部門層級設定已儲存。</div>
      )}
      {saved === "personal" && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">個人層級覆寫已儲存。</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{decodeURIComponent(error)}</div>
      )}

      {/* 部門層級設定 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-1">部門預設層級設定</h2>
        <p className="text-xs text-gray-400 mb-4">設定各部門的預設初評/複評主管（若員工未個別設定，則套用此處的部門預設）</p>

        <div className="space-y-4">
          {companies.map((co) => {
            const companyDepts = departments.filter((d) => d.companyId === co.id);
            if (companyDepts.length === 0) return null;
            return (
              <div key={co.id}>
                <h3 className="text-sm font-semibold text-navy mb-2">{co.name}</h3>
                <div className="space-y-3">
                  {companyDepts.map((dept) => {
                    const cfg = getDeptReviewConfig(dept.id);
                    const deptEmployees = employees.filter((e) => e.companyId === co.id);
                    return (
                      <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-sm mb-3">{dept.name}</p>
                        <form action={saveDeptConfig} className="grid md:grid-cols-3 gap-3 items-end">
                          <input type="hidden" name="departmentId" value={dept.id} />
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">預設初評主管</label>
                            <select className="select" name="primaryReviewerId" defaultValue={cfg?.defaultPrimaryReviewerId ?? ""}>
                              <option value="">（不設定）</option>
                              {deptEmployees.map((e) => (
                                <option key={e.id} value={e.id}>{e.name}・{e.title}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">預設複評主管</label>
                            <select className="select" name="secondaryReviewerId" defaultValue={cfg?.defaultSecondaryReviewerId ?? ""}>
                              <option value="">（不設定）</option>
                              {deptEmployees.map((e) => (
                                <option key={e.id} value={e.id}>{e.name}・{e.title}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <button type="submit" className="btn btn-primary w-full">儲存</button>
                          </div>
                        </form>
                        {cfg && (
                          <p className="text-xs text-gray-400 mt-2">
                            目前：初評 {deptEmployees.find((e) => e.id === cfg.defaultPrimaryReviewerId)?.name ?? "—"}・
                            複評 {deptEmployees.find((e) => e.id === cfg.defaultSecondaryReviewerId)?.name ?? "—"}
                            ・更新於 {new Date(cfg.updatedAt).toLocaleDateString("zh-TW")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 個人特殊層級覆寫 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-1">個人特殊層級覆寫</h2>
        <p className="text-xs text-gray-400 mb-4">若某位員工需要特殊的評核人設定（不同於部門預設），可在此個別設定</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">姓名</th>
                <th className="text-left px-3 py-2">職稱</th>
                <th className="text-left px-3 py-2">部門</th>
                <th className="text-left px-3 py-2">目前初評主管</th>
                <th className="text-left px-3 py-2">目前複評主管</th>
                <th className="text-left px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter((e) => !e.approverCompanyIds?.length && e.id !== "p001") // 排除最高層
                .map((emp) => {
                  const primary = emp.primaryReviewerId ? employees.find((e) => e.id === emp.primaryReviewerId) : null;
                  const secondary = emp.secondaryReviewerId ? employees.find((e) => e.id === emp.secondaryReviewerId) : null;
                  const dept = departments.find((d) => d.id === emp.departmentId);
                  const co = companies.find((c) => c.id === emp.companyId);
                  const companyEmps = employees.filter((e) => e.companyId === emp.companyId);
                  return (
                    <tr key={emp.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{emp.name}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{emp.title}</td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{co?.name} / {dept?.name}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{primary?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{secondary?.name ?? "—"}</td>
                      <td className="px-3 py-2">
                        <details className="text-xs">
                          <summary className="text-navy cursor-pointer">修改</summary>
                          <form action={savePersonalReviewer} className="mt-2 space-y-2 p-2 bg-gray-50 rounded">
                            <input type="hidden" name="employeeId" value={emp.id} />
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">初評主管</label>
                              <select className="select text-xs" name="primaryReviewerId" defaultValue={emp.primaryReviewerId ?? ""}>
                                <option value="">（無）</option>
                                {companyEmps.filter((e) => e.id !== emp.id).map((e) => (
                                  <option key={e.id} value={e.id}>{e.name}・{e.title}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">複評主管</label>
                              <select className="select text-xs" name="secondaryReviewerId" defaultValue={emp.secondaryReviewerId ?? ""}>
                                <option value="">（無）</option>
                                {companyEmps.filter((e) => e.id !== emp.id).map((e) => (
                                  <option key={e.id} value={e.id}>{e.name}・{e.title}</option>
                                ))}
                              </select>
                            </div>
                            <button type="submit" className="btn btn-primary text-xs py-1">儲存覆寫</button>
                          </form>
                        </details>
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
