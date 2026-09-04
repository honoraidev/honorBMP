import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import {
  getForm,
  getEmployee,
  getDepartment,
  getCompany,
  computeTotal,
  goalItemScore,
  fixedItemScore,
  STATUS_LABEL,
  getTemplatesForEmployee,
} from "@/lib/store";
import { canUserViewForm } from "@/lib/permissions";
import { RankingTier } from "@/lib/types";

const RANKING_LABELS: Record<RankingTier, string> = {
  T1: "等第一・表現亮眼",
  T2: "等第二・表現穩健",
  T3: "等第三・符合預期",
  T4: "等第四・尚可觀察",
  T5: "等第五・後續關注",
};

const TIER_LABEL: Record<string, string> = { exceed: "超標準", meet: "達目標", below: "未達標" };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const user = await getCurrentEmployee();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const { formId } = await params;
  const form = getForm(formId);
  if (!form) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!canUserViewForm(user, form)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const employee = getEmployee(form.employeeId)!;
  const dept = getDepartment(employee.departmentId);
  const co = getCompany(employee.companyId);
  const primary = employee.primaryReviewerId ? getEmployee(employee.primaryReviewerId) : null;
  const secondary = employee.secondaryReviewerId ? getEmployee(employee.secondaryReviewerId) : null;
  const total = computeTotal(form);

  const templates = getTemplatesForEmployee(employee);
  const allCustomFields = templates.flatMap((t) => t.fields).sort((a, b) => a.order - b.order);

  // 產生列印頁面 HTML（瀏覽器 print-to-PDF 方案）
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <title>${employee.name} 績效評核表 - ${new Date().getFullYear()}年度</title>
  <style>
    @media print {
      @page { margin: 18mm 15mm; size: A4 portrait; }
      .no-print { display: none !important; }
      body { font-size: 10pt; }
    }
    body {
      font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif;
      color: #1a1a2e;
      margin: 0; padding: 20px;
      background: #fff;
      line-height: 1.5;
    }
    h1 { font-size: 18pt; margin: 0 0 4px; }
    h2 { font-size: 11pt; color: #0f3460; border-bottom: 2px solid #0f3460; padding-bottom: 4px; margin: 16px 0 8px; }
    h3 { font-size: 10pt; margin: 8px 0 4px; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #0f3460; }
    .header-left p { margin: 2px 0; color: #555; font-size: 9pt; }
    .score-box { text-align: right; }
    .score-box .big { font-size: 28pt; font-weight: bold; color: #0f3460; }
    .score-box .label { font-size: 8pt; color: #999; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9pt; }
    th { background: #f0f4f8; text-align: left; padding: 5px 8px; font-weight: 600; }
    td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    .tier-tag { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 8pt; }
    .tier-exceed { background: #d1fae5; color: #065f46; }
    .tier-meet { background: #dbeafe; color: #1e40af; }
    .tier-below { background: #fee2e2; color: #991b1b; }
    .comment-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 10px; font-size: 9pt; margin-bottom: 6px; min-height: 36px; white-space: pre-wrap; }
    .sig-row { display: flex; gap: 24px; margin-top: 20px; }
    .sig-box { flex: 1; border-top: 1px solid #333; padding-top: 6px; text-align: center; font-size: 9pt; color: #555; }
    .status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 9pt; background: #e0e7ff; color: #3730a3; font-weight: 600; }
    .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #0f3460; color: white; border: none; border-radius: 8px; font-size: 13pt; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .attachment-list { font-size: 9pt; color: #555; }
    .attachment-list li { padding: 2px 0; }
    .custom-field { margin-bottom: 8px; }
    .custom-field-label { font-size: 9pt; font-weight: 600; color: #374151; }
    .custom-field-value { font-size: 9pt; color: #555; margin-top: 2px; }
  </style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()">🖨️ 列印 / 儲存 PDF</button>

  <div class="header">
    <div class="header-left">
      <h1>${employee.name}</h1>
      <p>${employee.title}・${co?.name ?? ""}・${dept?.name ?? ""}</p>
      <p>工號：${employee.employeeNo}・到職日：${employee.hireDate}</p>
      <p>初評主管：${primary?.name ?? "—"}・複評主管：${secondary?.name ?? "—"}</p>
      <p style="margin-top:6px">狀態：<span class="status-badge">${STATUS_LABEL[form.status]}</span></p>
    </div>
    <div class="score-box">
      <div class="big">${total}</div>
      <div class="label">合計得分 / 100</div>
      ${form.rankingTier ? `<div style="margin-top:4px;font-size:10pt;color:#0f3460;font-weight:600">${RANKING_LABELS[form.rankingTier]}</div>` : ""}
    </div>
  </div>

  <h2>（一）個人化目標項目（合計占75分）</h2>
  <table>
    <thead>
      <tr>
        <th style="width:4%">#</th>
        <th style="width:18%">項目標題</th>
        <th style="width:32%">達標定義</th>
        <th style="width:8%">配分</th>
        <th style="width:10%">自評</th>
        <th style="width:10%">初評</th>
        <th style="width:8%">得分</th>
      </tr>
    </thead>
    <tbody>
      ${form.goalItems
        .map(
          (item) => `
      <tr>
        <td>${item.order}</td>
        <td>${item.title || "—"}</td>
        <td>${item.standardDesc || "—"}</td>
        <td>${item.weight}</td>
        <td>${item.selfTier ? `<span class="tier-tag tier-${item.selfTier}">${TIER_LABEL[item.selfTier]}</span>` : "—"}</td>
        <td>${item.primaryTier ? `<span class="tier-tag tier-${item.primaryTier}">${TIER_LABEL[item.primaryTier]}</span>` : "—"}</td>
        <td>${goalItemScore(item)}</td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <h2>（二）公司統一行為項目（合計占25分）</h2>
  <table>
    <thead>
      <tr>
        <th style="width:20%">項目</th>
        <th style="width:16%">自評</th>
        <th style="width:16%">初評</th>
        <th style="width:8%">得分</th>
      </tr>
    </thead>
    <tbody>
      ${form.fixedItems
        .map(
          (item) => `
      <tr>
        <td>${item.label}</td>
        <td>${item.selfTier ? `<span class="tier-tag tier-${item.selfTier}">${TIER_LABEL[item.selfTier]}</span>` : "—"}</td>
        <td>${item.primaryTier ? `<span class="tier-tag tier-${item.primaryTier}">${TIER_LABEL[item.primaryTier]}</span>` : "—"}</td>
        <td>${fixedItemScore(item)}</td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <h2>（三）加減分與排名等第</h2>
  <table>
    <tbody>
      <tr><th>加減分</th><td>${form.bonusMalus > 0 ? "+" : ""}${form.bonusMalus} 分</td></tr>
      <tr><th>排名等第</th><td>${form.rankingTier ? RANKING_LABELS[form.rankingTier] : "尚未核定"}</td></tr>
    </tbody>
  </table>

  <h2>（四）意見回饋</h2>
  <h3>員工回顧本年度成長</h3>
  <div class="comment-box">${form.selfFeedbackGrowth || "（尚未填寫）"}</div>
  <h3>員工明年度目標</h3>
  <div class="comment-box">${form.selfFeedbackNextYear || "（尚未填寫）"}</div>
  <h3>初評主管面談意見</h3>
  <div class="comment-box">${form.primaryComment || "（尚未填寫）"}</div>
  <h3>複評主管職務發展評估</h3>
  <div class="comment-box">${form.secondaryDevAssessment || "（尚未填寫）"}</div>
  <h3>複評主管評核意見</h3>
  <div class="comment-box">${form.secondaryComment || "（尚未填寫）"}</div>

  ${allCustomFields.length > 0 ? `
  <h2>（五）自訂評核欄位</h2>
  ${allCustomFields
    .map(
      (field) => `
  <div class="custom-field">
    <div class="custom-field-label">${field.label}${field.required ? " *" : ""}</div>
    <div class="custom-field-value">${form.customFieldValues?.[field.id] || "（尚未填寫）"}</div>
  </div>`
    )
    .join("")}
  ` : ""}

  ${(form.attachments ?? []).length > 0 ? `
  <h2>附件清單</h2>
  <ul class="attachment-list">
    ${form.attachments.map((a) => `<li>📎 ${a.fileName}（${a.fileSize}・${a.uploaderName}）</li>`).join("")}
  </ul>
  ` : ""}

  <div class="sig-row">
    <div class="sig-box">
      <p>受評人</p>
      <p>${employee.name}</p>
      <p>${form.signatures.selfAt ? new Date(form.signatures.selfAt).toLocaleDateString("zh-TW") : "—"}</p>
    </div>
    <div class="sig-box">
      <p>初評主管</p>
      <p>${primary?.name ?? "—"}</p>
      <p>${form.signatures.primaryAt ? new Date(form.signatures.primaryAt).toLocaleDateString("zh-TW") : "—"}</p>
    </div>
    <div class="sig-box">
      <p>複評主管</p>
      <p>${secondary?.name ?? "—"}</p>
      <p>${form.signatures.secondaryAt ? new Date(form.signatures.secondaryAt).toLocaleDateString("zh-TW") : "—"}</p>
    </div>
    <div class="sig-box">
      <p>核決</p>
      <p>董事長</p>
      <p>${form.signatures.approvedAt ? new Date(form.signatures.approvedAt).toLocaleDateString("zh-TW") : "—"}</p>
    </div>
  </div>

  <p style="font-size:8pt;color:#aaa;text-align:right;margin-top:16px">
    列印時間：${new Date().toLocaleString("zh-TW")}・系統自動產生
  </p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
