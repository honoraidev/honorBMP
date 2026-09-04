import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getTemplate } from "@/lib/store";
import { isUserDeptManager } from "@/lib/permissions";
import { addField, deleteField } from "../actions";

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "單行文字",
  textarea: "多行文字說明",
  number: "數值輸入",
  score: "評分配分題（設定滿分）",
  select: "下拉選單",
  radio: "單選按鈕",
};

const STAGE_LABELS: Record<string, string> = {
  self: "員工（自評階段填寫）",
  primary: "初評主管（初評階段填寫）",
  secondary: "複評主管（複評階段填寫）",
};

export default async function TemplateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  const isManager = isUserDeptManager(user);
  if (!user.isHrAdmin && !isManager) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁限表單管理員或部門主管檢視。</div>;
  }

  const { templateId } = await params;
  const { error } = await searchParams;
  const template = getTemplate(templateId);
  if (!template) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy">{template.name}</h1>
            <span className="badge bg-teal/10 text-teal text-xs">自訂題目維護</span>
          </div>
          {template.description && <p className="text-sm text-gray-500 mt-1">{template.description}</p>}
        </div>
        <Link href="/hr/templates" className="btn btn-outline text-sm">← 返回模板列表</Link>
      </div>

      {error === "label_required" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          請填寫題目／欄位標題。
        </div>
      )}

      {/* 現有欄位 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4 flex items-center justify-between">
          <span>題目列表（共 {template.fields.length} 題）</span>
          <span className="text-xs text-gray-400 font-normal">依序套用於符合條件之考核表</span>
        </h2>
        {template.fields.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            目前尚無自訂題目。請於下方表單新增題目與配分。
          </div>
        ) : (
          <div className="space-y-2.5">
            {template.fields.map((field) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-3.5 flex items-center justify-between gap-3 hover:border-navy/30 transition">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-navy bg-navy/10 rounded px-2 py-1 font-mono">
                    #{field.order}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{field.label}</span>
                      {field.required && <span className="badge bg-red-50 text-red-600 text-xs">必填</span>}
                      {field.type === "score" && (
                        <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          滿分 {field.maxScore ?? 10} 分
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                      <span>題型：{FIELD_TYPE_LABELS[field.type]}</span>
                      <span>填寫者：{STAGE_LABELS[field.targetStage]}</span>
                      {field.hint && <span>提示：{field.hint}</span>}
                    </p>
                    {field.options && field.options.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">選項：{field.options.join(" / ")}</p>
                    )}
                  </div>
                </div>
                <form action={deleteField}>
                  <input type="hidden" name="templateId" value={templateId} />
                  <input type="hidden" name="fieldId" value={field.id} />
                  <button type="submit" className="text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded transition">
                    🗑️ 刪除
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新增欄位 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">➕ 新增題目／客製化欄位</h2>
        <form action={addField} className="space-y-4">
          <input type="hidden" name="templateId" value={templateId} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1">題目／指標名稱 *</label>
              <input className="input" name="label" placeholder="例：季度專案交付品質評估 或 專業證照取得" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">題目類型</label>
              <select className="select" name="type">
                {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">評分上限（若選評分配分題）</label>
              <input type="number" name="maxScore" className="input" defaultValue="10" placeholder="滿分，例：10 或 20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">填寫者／階段</label>
              <select className="select" name="targetStage">
                {Object.entries(STAGE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">是否必填</label>
              <select className="select" name="required">
                <option value="false">選填</option>
                <option value="true">必填</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-gray-700 block mb-1">題目說明與填寫提示（選填）</label>
              <input className="input" name="hint" placeholder="例：請主管依據本季專案覆盤結果，以具體成效量化評分" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-gray-700 block mb-1">選項設定（下拉選單／單選按鈕適用，每行一個選項）</label>
              <textarea className="textarea" name="options" rows={2} placeholder="表現傑出&#10;符合預期&#10;需再加強" />
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              確認新增題目
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
