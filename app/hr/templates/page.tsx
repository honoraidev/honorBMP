import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getTemplates, getStore, getDepartment, getCompany } from "@/lib/store";
import { isUserDeptManager } from "@/lib/permissions";
import { createTemplate, deleteTemplateAction } from "./actions";
import { batchDispatchFormsAction } from "@/app/form/actions";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; dispatchedCount?: string }>;
}) {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  const isManager = isUserDeptManager(user);
  if (!user.isHrAdmin && !isManager) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁限表單管理員或部門主管檢視。</div>;
  }

  const { error, dispatchedCount } = await searchParams;
  const templates = getTemplates();
  const { companies, departments, employees, forms } = getStore();

  // Subordinates / manageable employees for this user
  const subordinates = employees.filter((e) => {
    if (e.id === user.id) return false;
    if (user.isHrAdmin) return true;
    return e.primaryReviewerId === user.id || e.secondaryReviewerId === user.id || e.departmentId === user.departmentId;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">考核範本管理與主管派發中心</h1>
          <p className="text-sm text-gray-500 mt-1">
            主管可先設定好考核表範本（目標題庫、配分比例與指標），或重新建立新範本，再一鍵派發給底下同仁填寫自評。
          </p>
        </div>
        <Link href="/" className="btn btn-outline text-sm">← 返回總覽</Link>
      </div>

      {dispatchedCount && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>🚀 已成功批次套用範本並派發 <strong>{dispatchedCount}</strong> 份考核表給指定同仁！</span>
        </div>
      )}

      {error === "no_employees_selected" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          請至少勾選一位要派發考核表的同仁。
        </div>
      )}
      {error === "name_required" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          請填寫模板名稱。
        </div>
      )}

      {/* 🚀 主管批次派發專區 */}
      {subordinates.length > 0 && (
        <form action={batchDispatchFormsAction} className="card p-5 border-2 border-teal/40 bg-teal/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-teal/20 pb-3">
            <div>
              <h2 className="font-bold text-navy text-base flex items-center gap-2">
                <span>🚀</span> 批次派發考核表給底下同仁
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                步驟：選擇欲套用的「考核範本」 ➔ 勾選同仁名冊 ➔ 點擊派發即可將題目設定好並發放至員工端。
              </p>
            </div>
            <button type="submit" className="btn btn-teal text-xs py-2 px-4 shadow-sm font-bold">
              🚀 一鍵批次套用範本並派發
            </button>
          </div>

          <div className="grid md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                1. 選擇要套用之考核範本：
              </label>
              <select name="templateId" required className="select text-xs w-full py-2">
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({(t.goalItems || []).length} 目標題 + {t.fields.length} 自訂題)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400">
                套用後將自動覆寫並設定受評人的目標題目、達標定義與配分權重。
              </p>
            </div>

            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  2. 勾選要派發的同仁（共 {subordinates.length} 位）：
                </label>
                <span className="text-[11px] text-gray-400">可多選</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white p-2.5 divide-y divide-gray-100">
                {subordinates.map((emp) => {
                  const form = forms.find((f) => f.employeeId === emp.id);
                  const dept = getDepartment(emp.departmentId);
                  if (!form) return null;
                  return (
                    <label key={emp.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="formIds"
                          value={form.id}
                          defaultChecked={form.status === "goal_setting"}
                          className="rounded text-navy"
                        />
                        <span className="font-medium text-gray-900">{emp.name}</span>
                        <span className="text-gray-400 font-mono">({emp.employeeNo})</span>
                        <span className="text-gray-500">・{emp.title}・{dept?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {form.dispatchedAt ? (
                          <span className="badge bg-teal/10 text-teal text-[10px]">
                            已派發 ({new Date(form.dispatchedAt).toLocaleDateString("zh-TW")})
                          </span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-500 text-[10px]">尚未派發</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ➕ 新增範本 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-3 flex items-center gap-2">
          <span>📝</span> 建立新表單範本／自訂題目庫
        </h2>
        <form action={createTemplate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">範本名稱 *</label>
              <input className="input" name="name" placeholder="例：資訊研發處 專案工程師標準評核範本" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">範本說明（選填）</label>
              <input className="input" name="description" placeholder="例：設定季度系統開發指標與程式品質要求" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">限定公司（不選則套用全公司）</label>
              <select className="select" name="companyId" defaultValue={user.isHrAdmin ? "" : user.companyId}>
                <option value="">全部公司（通用）</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">限定部門（不選則套用全公司）</label>
              <select className="select" name="departmentId" defaultValue={user.isHrAdmin ? "" : user.departmentId}>
                <option value="">全部部門（通用）</option>
                {departments.map((d) => {
                  const co = companies.find((c) => c.id === d.companyId);
                  return (
                    <option key={d.id} value={d.id}>{co?.name} / {d.name}</option>
                  );
                })}
              </select>
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              ➕ 建立新範本並進入題目與配分設定
            </button>
          </div>
        </form>
      </div>

      {/* 現有模板列表 */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-bold text-navy text-base">現有考核範本庫（共 {templates.length} 個）</h2>
          <span className="text-xs text-gray-400">可隨時套用、修改題目或另存</span>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            目前尚無自訂範本。點擊上方「建立新範本」開始設定！
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((t) => {
              const co = t.companyId ? companies.find((c) => c.id === t.companyId)?.name : null;
              const dept = t.departmentId ? departments.find((d) => d.id === t.departmentId)?.name : null;
              const goals = t.goalItems || [];
              const goalPts = goals.reduce((s, g) => s + g.weight, 0);

              return (
                <div key={t.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between gap-3 hover:border-navy/30 transition bg-white shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-navy text-sm">{t.name}</h3>
                      <span className="badge bg-navy/10 text-navy text-[11px] shrink-0 font-medium">
                        {goals.length} 目標題 ({goalPts}分) + {t.fields.length} 自訂題
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>}

                    {/* 題目摘要預覽 */}
                    {goals.length > 0 && (
                      <div className="mt-2.5 bg-gray-50 rounded p-2 text-[11px] text-gray-600 space-y-1">
                        <span className="font-semibold text-gray-700 block">預設目標題目：</span>
                        {goals.slice(0, 3).map((g) => (
                          <div key={g.order} className="truncate">
                            • 第 {g.order} 題：{g.title} ({g.weight}分)
                          </div>
                        ))}
                        {goals.length > 3 && <div className="text-gray-400">...共 {goals.length} 題</div>}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2 flex flex-wrap gap-x-2">
                      <span>適用：{co ? co : "全公司"} {dept ? `・${dept}` : ""}</span>
                      <span>建立：{t.createdBy}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                    <Link href={`/hr/templates/${t.id}`} className="btn btn-outline text-xs py-1 px-3">
                      ⚙️ 維護題目與配分 →
                    </Link>
                    <form action={deleteTemplateAction}>
                      <input type="hidden" name="templateId" value={t.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded transition"
                      >
                        🗑️ 刪除
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
