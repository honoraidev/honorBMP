import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import {
  getForm,
  getEmployee,
  getDepartment,
  getCompany,
  computeTotal,
  goalItemScore,
  fixedItemScore,
  goalWeightSum,
  tierCounts,
  departmentEmployeeCount,
  allForms,
  STATUS_LABEL,
  getTemplatesForEmployee,
} from "@/lib/store";
import { getViewerContext, REJECTABLE_STATUS_SEQUENCE, STATUS_REJECT_LABEL } from "@/lib/permissions";
import { FIXED_ITEM_DEFS, RankingTier, FormStatus } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import TierRadioGroup from "@/components/TierRadioGroup";
import RankingPicker from "@/components/RankingPicker";
import {
  saveSelf,
  savePrimary,
  saveSecondary,
  returnStage,
  hrForward,
  approveForm,
  uploadAttachment,
  removeAttachment,
  updateGoalItemsAction,
  addGoalItemAction,
  deleteGoalItemAction,
} from "../actions";

const ERROR_MESSAGES: Record<string, string> = {
  self_incomplete: "無法送出：請完成全部評分，且個人目標配分總和須為75分。",
  primary_incomplete: "無法送出：請完成全部初評評分。",
  secondary_incomplete: "無法送出：請選擇排名等第後再送出。",
  return_reason_required: "退回前請填寫退回原因。",
  cannot_delete_all_goals: "至少須保留一個目標題目。",
  attachment_too_large: "附件過大（上限 10MB）。",
  attachment_invalid: "附件無效，請重新選擇。",
  no_permission: "您沒有執行此操作的權限。",
};

const DEV_OPTIONS = [
  "表現優異，具備承擔更高層級或更大範疇職務的能力",
  "表現良好，可進一步培養並輪調至其他適任職務",
  "表現穩定，現階段以維持現有職務為主",
  "建議調整職務內容，並啟動相關改善或支持計劃",
  "建議進行職務再配置，並優先推動強化與改善計劃",
];

const RANKING_TIER_LABEL_MAP: Record<RankingTier, string> = {
  T1: "等第一・表現亮眼",
  T2: "等第二・表現穩健",
  T3: "等第三・符合預期",
  T4: "等第四・尚可觀察",
  T5: "等第五・後續關注",
};

export default async function FormDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ error?: string; customized?: string }>;
}) {
  const { formId } = await params;
  const { error, customized } = await searchParams;
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");

  const form = getForm(formId);
  if (!form) notFound();
  const employee = getEmployee(form.employeeId);
  if (!employee) notFound();
  const dept = getDepartment(employee.departmentId);
  const company = getCompany(employee.companyId);

  const ctx = getViewerContext(user, employee, form);
  if (!ctx.canView) {
    return <div className="card p-6 text-center text-sm text-gray-500">您沒有權限檢視此考核表。</div>;
  }

  const total = computeTotal(form);
  const weightSum = goalWeightSum(form.goalItems);

  const deptForms = allForms().filter(
    (f) => getEmployee(f.employeeId)?.departmentId === employee.departmentId && f.id !== form.id
  );
  const deptCounts = tierCounts(deptForms);
  const deptTotal = departmentEmployeeCount(employee.departmentId);
  const relaxed = deptTotal < 4;

  const activeAction = ctx.canEditSelf ? saveSelf : ctx.canEditPrimary ? savePrimary : ctx.canEditSecondary ? saveSecondary : null;
  const submitLabel = ctx.canEditSelf
    ? "送出自評（電子簽署）"
    : ctx.canEditPrimary
    ? "送出初評（電子簽署）"
    : "送出複評（電子簽署）";

  // 適用的自訂欄位模板
  const templates = getTemplatesForEmployee(employee);
  const allCustomFields = templates.flatMap((t) => t.fields).sort((a, b) => a.order - b.order);

  // 判斷哪些自訂欄位在當前階段可編輯
  const currentStageForEdit = ctx.canEditSelf ? "self" : ctx.canEditPrimary ? "primary" : ctx.canEditSecondary ? "secondary" : null;

  // 可退回的目標步驟列表
  const currentStatusIdx = REJECTABLE_STATUS_SEQUENCE.indexOf(form.status);
  const rejectableTargets = REJECTABLE_STATUS_SEQUENCE.slice(0, currentStatusIdx);

  const attachments = form.attachments ?? [];

  const mainContent = (
    <>
      {/* Section: goal items 1-4 */}
      <section className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <SectionTitle title="考核評分（一）個人化目標項目" hint="與初評主管討論後填寫，合計占75分" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${weightSum === 75 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              配分合計：{weightSum} / 75 分 {weightSum === 75 ? "✓ 正確" : "⚠️ 建議調整為75分"}
            </span>
          </div>
        </div>

        {/* 主管/人資專屬：客製化題目與配分權重工具 */}
        {ctx.canCustomizeForm && (
          <details className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <summary className="text-sm font-bold text-navy cursor-pointer select-none flex items-center justify-between">
              <span>⚙️ 主管客製化題目與分數配分（點此展開管理題目）</span>
              <span className="text-xs text-teal font-normal">主管/人資權限可用</span>
            </summary>

            <div className="mt-4 space-y-4 pt-3 border-t border-slate-200">
              <p className="text-xs text-gray-500">
                您可以在此直接為此員工修改題目名稱、達標定義、調整配分權重（分數），或自由增減題目數量。
              </p>

              {/* 批次修改配分與題目表單 */}
              <form action={updateGoalItemsAction} className="space-y-3">
                <input type="hidden" name="formId" value={form.id} />
                <div className="space-y-3">
                  {form.goalItems.map((item) => (
                    <div key={item.order} className="bg-white border border-gray-200 rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-navy">第 {item.order} 題目設定</span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 font-medium">配分分數：</label>
                          <input
                            type="number"
                            name={`goal_${item.order}_weight`}
                            defaultValue={item.weight}
                            min={1}
                            max={75}
                            className="input w-20 text-center text-xs py-1"
                          />
                          <span className="text-xs text-gray-400">分</span>
                        </div>
                      </div>
                      <input
                        name={`goal_${item.order}_title`}
                        defaultValue={item.title}
                        placeholder={`題目標題（例：季度專案達標率）`}
                        className="input text-xs w-full"
                        required
                      />
                      <textarea
                        name={`goal_${item.order}_desc`}
                        defaultValue={item.standardDesc}
                        rows={2}
                        placeholder="達標定義與衡量指標（例：交付品質無缺失，如期達成）"
                        className="textarea text-xs w-full"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-mono">
                    目前各題配分合計：<strong>{weightSum}</strong> 分（目標 75 分）
                  </span>
                  <button type="submit" className="btn btn-primary text-xs py-1.5 px-4">
                    💾 儲存題目與配分修改
                  </button>
                </div>
              </form>

              {/* 新增一題 & 刪除題目操作列 */}
              <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <form action={addGoalItemAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="formId" value={form.id} />
                  <input
                    name="title"
                    placeholder="新增題目名稱"
                    className="input text-xs py-1 px-2.5 w-40"
                    required
                  />
                  <input
                    type="number"
                    name="weight"
                    defaultValue="15"
                    min={1}
                    max={75}
                    placeholder="配分"
                    className="input text-xs py-1 px-2 w-16 text-center"
                    required
                  />
                  <span className="text-xs text-gray-400">分</span>
                  <button type="submit" className="btn btn-outline text-xs py-1 px-3">
                    ➕ 新增一題目
                  </button>
                </form>

                {form.goalItems.length > 1 && (
                  <form action={deleteGoalItemAction} className="flex items-center gap-2">
                    <input type="hidden" name="formId" value={form.id} />
                    <select name="order" className="select text-xs py-1 px-2 w-32">
                      {form.goalItems.map((g) => (
                        <option key={g.order} value={g.order}>
                          刪除第 {g.order} 題
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-outline !text-red-600 !border-red-200 hover:!bg-red-50 text-xs py-1 px-3">
                      🗑️ 刪除
                    </button>
                  </form>
                )}
              </div>
            </div>
          </details>
        )}

        {/* 題目評分列表 */}
        <div className="space-y-4">
          {form.goalItems.map((item) => (
            <div key={item.order} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="badge bg-navy/10 text-navy font-semibold">第 {item.order} 項</span>
                <span className="text-xs text-gray-500 font-mono">
                  配分 <strong>{item.weight}</strong> 分・目前實得 <strong>{goalItemScore(item)}</strong> 分
                </span>
              </div>
              {ctx.canEditSelf ? (
                <div className="space-y-2">
                  <input className="input" name={`goal${item.order}Title`} defaultValue={item.title} placeholder="項目標題（如：計價請款）" required />
                  <textarea className="textarea" name={`goal${item.order}Desc`} defaultValue={item.standardDesc} rows={2} placeholder="達標定義（請具體化、數據化，例如：資料準時繳交，無需修正）" required />
                  <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500">配分分數</label>
                    <input className="input w-24" type="number" name={`goal${item.order}Weight`} defaultValue={item.weight} min={0} max={75} />
                    <span className="text-gray-400 text-xs">分（目前所有題目合計 {weightSum} 分）</span>
                  </div>
                  <TierRadioGroup name={`goal${item.order}Tier`} defaultValue={item.selfTier} />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="font-medium text-sm text-gray-900">{item.title || <span className="text-gray-400">（未填寫標題）</span>}</p>
                  <p className="text-xs text-gray-500">{item.standardDesc || <span className="text-gray-400">（未設定達標定義）</span>}</p>
                  <div className="flex flex-wrap gap-3 mt-1 items-start">
                    <ScoreTag label="自評" tier={item.selfTier} />
                    {ctx.canEditPrimary ? (
                      <div className="w-full mt-1">
                        <TierRadioGroup name={`goal${item.order}Tier`} defaultValue={item.primaryTier} compareLabel="員工自評" compareValue={item.selfTier} />
                      </div>
                    ) : (
                      <ScoreTag label="初評" tier={item.primaryTier} />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section: fixed items 5-9 */}
      <section className="card p-5">
        <SectionTitle title="考核評分（二）公司統一行為項目" hint="第5–9項，各5分，合計占25分" />
        <div className="grid md:grid-cols-2 gap-4">
          {form.fixedItems.map((item) => {
            const def = FIXED_ITEM_DEFS.find((d) => d.key === item.key)!;
            return (
              <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{item.label}</span>
                  <span className="text-xs text-gray-400">得分 {fixedItemScore(item)} 分</span>
                </div>
                {ctx.canEditSelf ? (
                  <TierRadioGroup name={`fixed_${item.key}_Tier`} defaultValue={item.selfTier} descriptions={def.desc} />
                ) : ctx.canEditPrimary ? (
                  <TierRadioGroup name={`fixed_${item.key}_Tier`} defaultValue={item.primaryTier} descriptions={def.desc} compareLabel="員工自評" compareValue={item.selfTier} />
                ) : (
                  <div className="flex gap-3">
                    <ScoreTag label="自評" tier={item.selfTier} />
                    <ScoreTag label="初評" tier={item.primaryTier} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: item 10 + secondary review */}
      <section className="card p-5">
        <SectionTitle title="複評主管加減分與排名等第" hint="第10項為選填加減分；排名等第由複評主管核定" />
        {ctx.canEditSecondary ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">加減分（選填，範圍 -10 ~ +10）</label>
              <input className="input w-32" type="number" name="bonusMalus" defaultValue={form.bonusMalus} min={-10} max={10} />
            </div>
            <RankingPicker
              deptCounts={deptCounts}
              deptTotal={deptTotal}
              deptName={dept?.name || ""}
              defaultValue={form.rankingTier}
              relaxed={relaxed}
              defaultReason={form.rankingOverrideReason}
            />
          </div>
        ) : (
          <div className="text-sm space-y-2 text-gray-600">
            <p>加減分：{form.bonusMalus > 0 ? `+${form.bonusMalus}` : form.bonusMalus} 分</p>
            <p>
              排名等第：
              {form.rankingTier ? (
                <span className="font-semibold text-navy ml-1">{RANKING_TIER_LABEL_MAP[form.rankingTier]}</span>
              ) : (
                <span className="text-gray-400 ml-1">（尚未核定）</span>
              )}
            </p>
            {form.rankingOverrideReason && (
              <p className="text-xs text-gray-500">等第備註／突破限制原因：{form.rankingOverrideReason}</p>
            )}
          </div>
        )}
      </section>

      {/* Section: feedback */}
      <section className="card p-5 space-y-4">
        <SectionTitle title="意見回饋與評核意見" />

        <div>
          <h3 className="text-sm font-semibold mb-1">員工意見回饋</h3>
          {ctx.canEditSelf ? (
            <div className="space-y-2">
              <FieldLabel text="(1) 回顧本年度，評估自身在能力與工作方式上的成長及不足處，並提出可提升效能的協助需求" />
              <textarea className="textarea" name="feedbackGrowth" rows={3} defaultValue={form.selfFeedbackGrowth} required />
              <FieldLabel text="(2) 請提出明年度之工作重點與發展目標" />
              <textarea className="textarea" name="feedbackNextYear" rows={3} defaultValue={form.selfFeedbackNextYear} required />
            </div>
          ) : (
            <div className="text-sm text-gray-600 space-y-2">
              <p>{form.selfFeedbackGrowth || <span className="text-gray-400">（尚未填寫）</span>}</p>
              <p>{form.selfFeedbackNextYear}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">初評主管面談意見</h3>
          {ctx.canEditPrimary ? (
            <textarea className="textarea" name="primaryComment" rows={3} defaultValue={form.primaryComment} placeholder="請簡述該員工的主要優勢與待發展方向，並提出可協助其提升的具體建議或培育方式。" required />
          ) : (
            <p className="text-sm text-gray-600">{form.primaryComment || <span className="text-gray-400">（尚未填寫）</span>}</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">複評主管評核意見</h3>
          {ctx.canEditSecondary ? (
            <div className="space-y-2">
              <select className="select" name="secondaryDevAssessment" defaultValue={form.secondaryDevAssessment} required>
                <option value="" disabled>
                  請選擇對此員工職務發展的評估
                </option>
                {DEV_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <textarea className="textarea" name="secondaryComment" rows={3} defaultValue={form.secondaryComment} placeholder="說明或意見" />
            </div>
          ) : (
            <div className="text-sm text-gray-600 space-y-1">
              <p>{form.secondaryDevAssessment || <span className="text-gray-400">（尚未填寫）</span>}</p>
              <p>{form.secondaryComment}</p>
            </div>
          )}
        </div>
      </section>

      {/* Section: 自訂欄位 */}
      {allCustomFields.length > 0 && (
        <section className="card p-5 space-y-4">
          <SectionTitle title="自訂評核欄位與題目" hint="由主管或人資設定的專屬評核項目" />
          {allCustomFields.map((field) => {
            const isEditable = currentStageForEdit === field.targetStage;
            const savedValue = form.customFieldValues?.[field.id] ?? "";
            return (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{field.label}</span>
                  {field.required && <span className="text-red-500 text-xs">*必填</span>}
                  {field.type === "score" && (
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                      評分配分題（滿分 {field.maxScore ?? 10} 分）
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {field.targetStage === "self" ? "員工填寫" : field.targetStage === "primary" ? "初評主管填寫" : "複評主管填寫"}
                  </span>
                </div>
                {field.hint && <p className="text-xs text-gray-400 mb-2">{field.hint}</p>}
                {isEditable ? (
                  <>
                    {field.type === "textarea" && (
                      <textarea className="textarea" name={`custom_${field.id}`} defaultValue={savedValue} rows={3} required={field.required} />
                    )}
                    {field.type === "text" && (
                      <input className="input" name={`custom_${field.id}`} defaultValue={savedValue} required={field.required} />
                    )}
                    {field.type === "number" && (
                      <input className="input w-40" type="number" name={`custom_${field.id}`} defaultValue={savedValue} required={field.required} />
                    )}
                    {field.type === "score" && (
                      <div className="flex items-center gap-2">
                        <input className="input w-32" type="number" min={0} max={field.maxScore ?? 100} name={`custom_${field.id}`} defaultValue={savedValue} required={field.required} placeholder={`0 ~ ${field.maxScore ?? 10}`} />
                        <span className="text-xs text-gray-400">分（滿分 {field.maxScore ?? 10} 分）</span>
                      </div>
                    )}
                    {field.type === "select" && (
                      <select className="select" name={`custom_${field.id}`} defaultValue={savedValue} required={field.required}>
                        <option value="">請選擇</option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === "radio" && (
                      <div className="flex flex-wrap gap-3">
                        {(field.options ?? []).map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input type="radio" name={`custom_${field.id}`} value={opt} defaultChecked={savedValue === opt} required={field.required} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-600">{savedValue || <span className="text-gray-400">（尚未填寫）</span>}</p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {activeAction && (
        <div className="card p-5 flex flex-wrap gap-2">
          <button type="submit" name="mode" value="draft" className="btn btn-outline">
            儲存草稿
          </button>
          <button type="submit" name="mode" value="submit" className="btn btn-primary">
            {submitLabel}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {customized && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>✅ 目標題目與分數配分已成功更新！</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {ERROR_MESSAGES[error] || "操作失敗，請檢查表單內容。"}
        </div>
      )}

      {/* Header */}
      <div className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">
            {employee.name}　<span className="text-sm font-normal text-gray-500">{employee.title}・{company?.name}・{dept?.name}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            工號 {employee.employeeNo}・到職日 {employee.hireDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={form.status} />
          <div className="text-right">
            <div className="text-2xl font-bold text-navy">
              {total}
              <span className="text-sm font-normal text-gray-400"> / 100</span>
            </div>
            <div className="text-xs text-gray-400">目前合計分數</div>
          </div>
        </div>
      </div>

      {form.returnReason && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          此表曾被退回，原因：{form.returnReason}
        </div>
      )}

      {activeAction ? (
        <form action={activeAction} className="space-y-6">
          <input type="hidden" name="formId" value={form.id} />
          {mainContent}
        </form>
      ) : (
        <div className="space-y-6">{mainContent}</div>
      )}

      {/* 附件區塊 */}
      <section className="card p-5 space-y-4">
        <SectionTitle title="主管附件上傳" hint="初評/複評主管可上傳相關佐證資料" />

        {/* 現有附件列表 */}
        {attachments.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {attachments.map((att) => (
              <li key={att.id} className="py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">📎</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{att.fileName}</p>
                    <p className="text-xs text-gray-400">
                      {att.fileSize}・{att.uploaderName}・
                      {new Date(att.uploadedAt).toLocaleString("zh-TW")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* 下載連結 */}
                  <a
                    href={`data:${att.fileMime};base64,${att.fileData}`}
                    download={att.fileName}
                    className="text-navy text-xs hover:underline"
                  >
                    下載
                  </a>
                  {/* 刪除（上傳者或 HR 可刪） */}
                  {(att.uploaderId === user.id || user.isHrAdmin) && (
                    <form action={removeAttachment}>
                      <input type="hidden" name="formId" value={form.id} />
                      <input type="hidden" name="attachmentId" value={att.id} />
                      <button type="submit" className="text-red-500 text-xs hover:underline">
                        刪除
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">尚無附件</p>
        )}

        {/* 上傳表單：只有有權限的主管可看到 */}
        {ctx.canUploadAttachment && (
          <AttachmentUploadForm formId={form.id} />
        )}
      </section>

      {/* Cross-role actions */}
      <div className="space-y-3">
        {ctx.canHrForward && (
          <form action={hrForward} className="card p-5">
            <input type="hidden" name="formId" value={form.id} />
            <button type="submit" className="btn btn-teal">
              彙整完成，送交董事長核決 →
            </button>
          </form>
        )}
        {ctx.canApprove && (
          <form action={approveForm} className="card p-5">
            <input type="hidden" name="formId" value={form.id} />
            <button type="submit" className="btn btn-primary">
              核准通過（董事長核決）
            </button>
          </form>
        )}
        {ctx.canReturn && (
          <details className="card p-5">
            <summary className="text-sm text-red-600 cursor-pointer select-none">退回此表單…</summary>
            <form action={returnStage} className="mt-3 space-y-3">
              <input type="hidden" name="formId" value={form.id} />
              {/* 指定退回目標步驟 */}
              {rejectableTargets.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">退回到哪個步驟（預設：退回上一步）</label>
                  <select className="select" name="targetStep">
                    <option value="">退回上一步（{STATUS_LABEL[REJECTABLE_STATUS_SEQUENCE[currentStatusIdx - 1] as FormStatus] ?? "上一步"}）</option>
                    {rejectableTargets.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_REJECT_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <textarea className="textarea" name="reason" rows={2} placeholder="請填寫退回原因（必填）" required />
              <button type="submit" className="btn btn-outline !text-red-600 !border-red-200 hover:!bg-red-50">
                確認退回
              </button>
            </form>
          </details>
        )}
        {!activeAction && !ctx.canHrForward && !ctx.canApprove && !ctx.canReturn && (
          <p className="text-sm text-gray-400 px-1">目前狀態：{STATUS_LABEL[form.status]}・無待您執行的操作。</p>
        )}
      </div>

      {/* 退回歷程 */}
      {(form.rejectHistory ?? []).length > 0 && (
        <details className="card p-5">
          <summary className="text-sm font-semibold cursor-pointer select-none">退回/駁回紀錄</summary>
          <ul className="mt-3 space-y-2 text-xs text-gray-500">
            {(form.rejectHistory ?? []).map((r, i) => (
              <li key={i} className="border-l-2 border-red-200 pl-3">
                <p className="text-gray-400">{new Date(r.at).toLocaleString("zh-TW")}・{r.actorName}</p>
                <p>從「{STATUS_LABEL[r.fromStep]}」退回至「{STATUS_LABEL[r.targetStep]}」</p>
                {r.reason && <p className="text-gray-500 mt-0.5">原因：{r.reason}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* History */}
      <details className="card p-5">
        <summary className="text-sm font-semibold cursor-pointer select-none">操作紀錄（稽核軌跡）</summary>
        <ul className="mt-3 space-y-1.5 text-xs text-gray-500">
          {form.history
            .slice()
            .reverse()
            .map((h, i) => (
              <li key={i}>
                <span className="text-gray-400">{new Date(h.at).toLocaleString("zh-TW")}</span>
                {" · "}
                <span className="font-medium text-gray-700">{h.actor}</span>
                {" · "}
                {h.action}
                {h.note && <span className="text-gray-400">（{h.note}）</span>}
              </li>
            ))}
        </ul>
      </details>

      {/* 獨立醒目的匯出區塊 */}
      <section className="card p-5 border-2 border-navy/20 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-bold text-navy text-base">📄 匯出評核表</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              本評核表支援隨時列印或另存為 PDF，以及下載 Word 檔（.docx）進行紙本歸檔或呈閱。
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`/api/form/${form.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-sm flex items-center gap-1.5"
            >
              <span>🖨️</span> 列印 / 儲存 PDF
            </a>
            <a
              href={`/api/form/${form.id}/docx`}
              download
              className="btn btn-outline text-sm flex items-center gap-1.5"
            >
              <span>📥</span> 匯出 Word (.docx)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-bold text-navy text-base">{title}</h2>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <p className="text-xs text-gray-500 mb-1">{text}</p>;
}

function ScoreTag({ label, tier }: { label: string; tier: string | null | undefined }) {
  const map: Record<string, { label: string; cls: string }> = {
    exceed: { label: "超標準", cls: "bg-teal/10 text-teal" },
    meet: { label: "達目標", cls: "bg-blue-50 text-blue-700" },
    below: { label: "未達標", cls: "bg-red-50 text-red-700" },
  };
  const t = tier ? map[tier] : null;
  return (
    <span className="text-xs">
      <span className="text-gray-400 mr-1">{label}：</span>
      {t ? <span className={`badge ${t.cls}`}>{t.label}</span> : <span className="text-gray-300">尚未評分</span>}
    </span>
  );
}

/** Client-side file picker that converts file to base64 and posts via hidden inputs. */
function AttachmentUploadForm({ formId }: { formId: string }) {
  const nameId = `att-name-${formId}`;
  const mimeId = `att-mime-${formId}`;
  const dataId = `att-data-${formId}`;
  const fileInputId = `att-file-${formId}`;
  const labelId = `att-label-${formId}`;

  return (
    <form action={uploadAttachment} className="border border-dashed border-gray-200 rounded-lg p-4 space-y-3">
      <input type="hidden" name="formId" value={formId} />
      <input type="hidden" name="fileName" id={nameId} />
      <input type="hidden" name="fileMime" id={mimeId} />
      <input type="hidden" name="fileData" id={dataId} />

      <p className="text-xs font-semibold text-gray-600">上傳新附件（支援 PDF、Word、圖片等，上限 10MB）</p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          id={fileInputId}
          className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-navy/10 file:text-navy hover:file:bg-navy/20 cursor-pointer"
        />
        <span id={labelId} className="text-xs text-gray-400">尚未選擇檔案</span>
        <button type="submit" className="btn btn-outline text-xs">
          確認上傳
        </button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var input = document.getElementById("${fileInputId}");
              if (!input) return;
              input.addEventListener("change", function(e) {
                var file = e.target.files && e.target.files[0];
                if (!file) return;
                var label = document.getElementById("${labelId}");
                if (label) label.textContent = file.name + " (" + (file.size/1024).toFixed(1) + " KB)";
                var nameEl = document.getElementById("${nameId}");
                var mimeEl = document.getElementById("${mimeId}");
                var dataEl = document.getElementById("${dataId}");
                if (nameEl) nameEl.value = file.name;
                if (mimeEl) mimeEl.value = file.type || "application/octet-stream";
                var reader = new FileReader();
                reader.onload = function(evt) {
                  var res = evt.target && evt.target.result;
                  if (typeof res === "string" && dataEl) {
                    var base64 = res.split(",")[1] || "";
                    dataEl.value = base64;
                  }
                };
                reader.readAsDataURL(file);
              });
            })();
          `,
        }}
      />
    </form>
  );
}
