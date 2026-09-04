import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getTemplates, getStore } from "@/lib/store";
import { isUserDeptManager } from "@/lib/permissions";
import { createTemplate, deleteTemplateAction } from "./actions";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  const isManager = isUserDeptManager(user);
  if (!user.isHrAdmin && !isManager) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁限表單管理員或部門主管檢視。</div>;
  }

  const { error } = await searchParams;
  const templates = getTemplates();
  const { companies, departments } = getStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">表單題目與客製化模板管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            主管與人資可自訂評核題目、題目分數/配分權重、題型與填寫階段，自動套用至員工評核表。
          </p>
        </div>
        <Link href="/" className="btn btn-outline text-sm">← 返回總覽</Link>
      </div>

      {error === "name_required" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          請填寫模板名稱。
        </div>
      )}

      {/* 新增模板 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-3 flex items-center gap-2">
          <span>📝</span> 建立新表單模板／加考題庫
        </h2>
        <form action={createTemplate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">模板名稱 *</label>
              <input className="input" name="name" placeholder="例：資訊研發處 專案成果與技術創新加考題" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">說明（選填）</label>
              <input className="input" name="description" placeholder="例：針對技術職位新增之專業指標與配分" />
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
              ➕ 建立模板並進入題目設定
            </button>
          </div>
        </form>
      </div>

      {/* 現有模板列表 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">現有客製化模板（共 {templates.length} 個）</h2>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            目前尚無自訂模板。點擊上方「建立模板」開始為您的部門或公司新增題目與配分！
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => {
              const co = t.companyId ? companies.find((c) => c.id === t.companyId)?.name : null;
              const dept = t.departmentId ? departments.find((d) => d.id === t.departmentId)?.name : null;
              return (
                <div key={t.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-navy/30 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy text-sm">{t.name}</p>
                      <span className="badge bg-navy/10 text-navy text-xs">
                        {t.fields.length} 個自訂題目
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-gray-500 mt-1">{t.description}</p>}
                    <p className="text-xs text-gray-400 mt-1.5 flex flex-wrap gap-x-3">
                      <span>適用：{co ? co : "全部公司"} {dept ? `・${dept}` : "・全部部門"}</span>
                      <span>建立者：{t.createdBy}</span>
                      <span>更新：{new Date(t.updatedAt).toLocaleDateString("zh-TW")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/hr/templates/${t.id}`} className="btn btn-outline text-xs">
                      ⚙️ 題目與分數設定 →
                    </Link>
                    <form action={deleteTemplateAction}>
                      <input type="hidden" name="templateId" value={t.id} />
                      <button
                        type="submit"
                        className="btn btn-outline text-xs !text-red-600 !border-red-200 hover:!bg-red-50"
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
