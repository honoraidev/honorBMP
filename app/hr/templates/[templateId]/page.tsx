import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getTemplate } from "@/lib/store";
import { addField, deleteField } from "../actions";

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "單行文字",
  textarea: "多行文字",
  number: "數字",
  select: "下拉選單",
  radio: "單選按鈕",
};

const STAGE_LABELS: Record<string, string> = {
  self: "員工（自評）",
  primary: "初評主管",
  secondary: "複評主管",
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
  if (!user.isHrAdmin) return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限表單管理員檢視。</div>;

  const { templateId } = await params;
  const { error } = await searchParams;
  const template = getTemplate(templateId);
  if (!template) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">{template.name}</h1>
          {template.description && <p className="text-sm text-gray-500 mt-1">{template.description}</p>}
        </div>
        <Link href="/hr/templates" className="btn btn-outline text-sm">← 返回模板列表</Link>
      </div>

      {error === "label_required" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">請填寫欄位標籤名稱。</div>
      )}

      {/* 現有欄位 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">欄位列表（共 {template.fields.length} 個）</h2>
        {template.fields.length === 0 ? (
          <p className="text-sm text-gray-400">尚無欄位，請於下方新增。</p>
        ) : (
          <div className="space-y-2">
            {template.fields.map((field) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-mono w-6 text-center">{field.order}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{field.label}</span>
                      {field.required && <span className="badge bg-red-50 text-red-600 text-xs">必填</span>}
                    </div>
                    <p className="text-xs text-gray-400">
                      {FIELD_TYPE_LABELS[field.type]}・填寫者：{STAGE_LABELS[field.targetStage]}
                      {field.hint && `・${field.hint}`}
                    </p>
                    {field.options && field.options.length > 0 && (
                      <p className="text-xs text-gray-400">選項：{field.options.join(" / ")}</p>
                    )}
                  </div>
                </div>
                <form action={deleteField}>
                  <input type="hidden" name="templateId" value={templateId} />
                  <input type="hidden" name="fieldId" value={field.id} />
                  <button type="submit" className="text-red-500 text-xs hover:underline">刪除</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新增欄位 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">新增欄位</h2>
        <form action={addField} className="space-y-4">
          <input type="hidden" name="templateId" value={templateId} />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">欄位標籤 *</label>
              <input className="input" name="label" placeholder="例：專案貢獻說明" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">欄位類型</label>
              <select className="select" name="type">
                {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">填寫者</label>
              <select className="select" name="targetStage">
                {Object.entries(STAGE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">必填</label>
              <select className="select" name="required">
                <option value="false">選填</option>
                <option value="true">必填</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">說明文字（選填）</label>
              <input className="input" name="hint" placeholder="填寫提示，例如：請以具體數字說明" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">選項（下拉/單選才需填，每行一個選項）</label>
              <textarea className="textarea" name="options" rows={3} placeholder="選項A&#10;選項B&#10;選項C" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">新增欄位</button>
        </form>
      </div>
    </div>
  );
}
