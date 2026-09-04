import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getTemplates, getStore } from "@/lib/store";
import { createTemplate, deleteTemplateAction } from "./actions";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  if (!user.isHrAdmin) return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限表單管理員檢視。</div>;

  const { error } = await searchParams;
  const templates = getTemplates();
  const { companies, departments } = getStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">表單客製化管理</h1>
          <p className="text-sm text-gray-500 mt-1">建立自訂欄位模板，套用至員工評核表單</p>
        </div>
        <Link href="/hr" className="btn btn-outline text-sm">← 返回人資看板</Link>
      </div>

      {error === "name_required" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">請填寫模板名稱。</div>
      )}

      {/* 新增模板 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">新增表單模板</h2>
        <form action={createTemplate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">模板名稱 *</label>
              <input className="input" name="name" placeholder="例：2026年度特殊職務評核附加欄位" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">說明（選填）</label>
              <input className="input" name="description" placeholder="模板用途說明" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">限定公司（不選則套用所有公司）</label>
              <select className="select" name="companyId">
                <option value="">全部公司</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">限定部門（不選則套用所有部門）</label>
              <select className="select" name="departmentId">
                <option value="">全部部門</option>
                {departments.map((d) => {
                  const co = companies.find((c) => c.id === d.companyId);
                  return (
                    <option key={d.id} value={d.id}>{co?.name} / {d.name}</option>
                  );
                })}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">建立模板</button>
        </form>
      </div>

      {/* 現有模板列表 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">現有模板（共 {templates.length} 個）</h2>
        {templates.length === 0 ? (
          <p className="text-sm text-gray-400">尚無模板，請點上方「建立模板」。</p>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => {
              const co = t.companyId ? companies.find((c) => c.id === t.companyId)?.name : null;
              const dept = t.departmentId ? departments.find((d) => d.id === t.departmentId)?.name : null;
              return (
                <div key={t.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    {t.description && <p className="text-xs text-gray-400">{t.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {co ? `公司：${co}` : "全部公司"}
                      {dept ? `・部門：${dept}` : "・全部部門"}
                      ・{t.fields.length} 個欄位
                      ・更新於 {new Date(t.updatedAt).toLocaleDateString("zh-TW")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/hr/templates/${t.id}`} className="btn btn-outline text-xs">
                      管理欄位 →
                    </Link>
                    <form action={deleteTemplateAction}>
                      <input type="hidden" name="templateId" value={t.id} />
                      <button
                        type="submit"
                        className="btn btn-outline text-xs !text-red-600 !border-red-200 hover:!bg-red-50"
                        onClick={() => {}} // Intentional placeholder for UX
                      >
                        刪除
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
