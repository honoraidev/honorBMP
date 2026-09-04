import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getTemplate } from "@/lib/store";
import { isUserDeptManager } from "@/lib/permissions";
import { 
  addField, 
  deleteField, 
  updateTemplateGoalsAction, 
  addTemplateGoalAction, 
  deleteTemplateGoalAction 
} from "../actions";

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
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  const isManager = isUserDeptManager(user);
  if (!user.isHrAdmin && !isManager) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁限表單管理員或部門主管檢視。</div>;
  }

  const { templateId } = await params;
  const { error, success } = await searchParams;
  const template = getTemplate(templateId);
  if (!template) notFound();

  const goalItems = template.goalItems || [];
  const totalGoalWeight = goalItems.reduce((acc, cur) => acc + (cur.weight || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy">{template.name}</h1>
            <span className="badge bg-teal/10 text-teal text-xs">考核範本設定</span>
          </div>
          {template.description && <p className="text-sm text-gray-500 mt-1">{template.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hr/templates" className="btn btn-outline text-sm">← 返回範本列表</Link>
        </div>
      </div>

      {error === "label_required" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          請填寫題目／欄位標題。
        </div>
      )}
      {success === "goals_updated" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          ✅ 目標題目與配分已成功儲存！
        </div>
      )}

      {/* 區塊一：預設目標題目與配分設定 */}
      <div className="card p-5 border-t-4 border-t-navy">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-navy flex items-center gap-2">
              <span>🎯 範本預設目標項目與配分</span>
              <span className="badge bg-navy/10 text-navy text-xs">共 {goalItems.length} 項</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">派發給同仁時，將以此題目與配分為基礎進行自評填寫</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded border ${totalGoalWeight === 100 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              合計配分：{totalGoalWeight}% {totalGoalWeight === 100 ? "（標準100%）" : "（建議配滿100%）"}
            </span>
          </div>
        </div>

        {goalItems.length > 0 ? (
          <div className="space-y-3">
            <form action={updateTemplateGoalsAction} className="space-y-3">
              <input type="hidden" name="templateId" value={templateId} />
              <div className="space-y-3">
                {goalItems.map((goal) => (
                  <div key={goal.order} className="border border-gray-200 rounded-lg p-3.5 bg-gray-50/50 hover:bg-white transition space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-navy bg-navy/10 rounded px-2 py-0.5 font-mono">
                          目標 #{goal.order}
                        </span>
                        <input 
                          type="text" 
                          name={`goal_${goal.order}_title`} 
                          defaultValue={goal.title} 
                          placeholder="工作目標名稱"
                          className="input text-sm font-semibold py-1 px-2.5 flex-1"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 whitespace-nowrap">配分權重:</span>
                          <input 
                            type="number" 
                            name={`goal_${goal.order}_weight`} 
                            defaultValue={goal.weight} 
                            min="0" 
                            max="100"
                            className="input w-20 text-right text-sm font-mono py-1 px-2" 
                            required
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-0.5">達標標準／具體衡量定義：</label>
                      <textarea 
                        name={`goal_${goal.order}_desc`} 
                        defaultValue={goal.standardDesc || ""} 
                        rows={2} 
                        placeholder="例：於Q3前如期上線並達成99.9%可用性..." 
                        className="textarea text-xs w-full py-1.5 px-2.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button type="submit" className="btn btn-primary text-sm shadow-sm">
                  💾 儲存目標題目與配分修改
                </button>
              </div>
            </form>
            
            {goalItems.length > 1 && (
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>單獨刪除目標項目：</span>
                {goalItems.map((g) => (
                  <form key={g.order} action={deleteTemplateGoalAction} className="inline">
                    <input type="hidden" name="templateId" value={templateId} />
                    <input type="hidden" name="order" value={g.order} />
                    <button 
                      type="submit" 
                      className="px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition text-xs"
                      title={`刪除目標 #${g.order}`}
                    >
                      🗑️ 刪除 #{g.order}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg">
            目前此範本尚無預設目標。請於下方快速新增目標項目。
          </div>
        )}

        {/* 快速新增目標 */}
        <div className="mt-4 pt-4 border-t border-gray-100 bg-teal/5 rounded-lg p-3">
          <h3 className="text-xs font-bold text-navy mb-2">➕ 快速新增目標項目至此範本</h3>
          <form action={addTemplateGoalAction} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input type="hidden" name="templateId" value={templateId} />
            <input 
              name="title" 
              placeholder="新目標項目名稱（例：拓展新通路合作）" 
              className="input text-xs sm:col-span-5" 
              required 
            />
            <input 
              name="criteria" 
              placeholder="達標衡量標準（選填）" 
              className="input text-xs sm:col-span-4" 
            />
            <input 
              type="number" 
              name="weight" 
              placeholder="權重%" 
              defaultValue="20" 
              className="input text-xs sm:col-span-2 text-right" 
              required 
            />
            <button type="submit" className="btn btn-teal text-xs sm:col-span-1 py-1">
              新增
            </button>
          </form>
        </div>
      </div>

      {/* 區塊二：現有自訂題目與擴充欄位 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4 flex items-center justify-between">
          <span>📝 額外客製化欄位（共 {template.fields.length} 題）</span>
          <span className="text-xs text-gray-400 font-normal">填寫自評或主管評核時之延伸問答與加分題</span>
        </h2>
        {template.fields.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            目前尚無額外自訂欄位。可於下方新增問答題、加分題或綜合評語欄位。
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

      {/* 新增額外欄位表單 */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">➕ 新增額外客製化欄位</h2>
        <form action={addField} className="space-y-4">
          <input type="hidden" name="templateId" value={templateId} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1">題目／欄位名稱 *</label>
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
              確認新增題目欄位
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

