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
  T1: "等第一（特優・表現卓越）",
  T2: "等第二（優良・表現穩健）",
  T3: "等第三（甲等・符合預期）",
  T4: "等第四（乙等・尚可觀察）",
  T5: "等第五（丙等・後續關注）",
};

const TIER_LABEL: Record<string, string> = { exceed: "超標準 (100%)", meet: "達目標 (85%)", below: "未達標 (60%)" };

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

  // Goal items subtotal & Fixed items subtotal
  const goalSubtotal = form.goalItems.reduce((acc, item) => acc + goalItemScore(item), 0);
  const fixedSubtotal = form.fixedItems.reduce((acc, item) => acc + fixedItemScore(item), 0);

  const templates = getTemplatesForEmployee(employee);
  const allCustomFields = templates.flatMap((t) => t.fields).sort((a, b) => a.order - b.order);

  const printTime = new Date().toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <title>${employee.name}_${employee.employeeNo}_績效評核表_${new Date().getFullYear()}年度</title>
  <style>
    @media print {
      @page {
        size: A4 portrait;
        margin: 12mm 14mm 14mm 14mm;
      }
      .no-print {
        display: none !important;
      }
      body {
        background: #fff !important;
        padding: 0 !important;
        font-size: 9.5pt;
      }
      .page-break {
        page-break-before: always;
      }
      .avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
      color: #111827;
      margin: 0;
      padding: 24px;
      background: #f8fafc;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    .doc-container {
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      padding: 36px 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 4px;
      position: relative;
    }

    @media print {
      .doc-container {
        box-shadow: none;
        padding: 0;
        margin: 0;
        max-width: 100%;
      }
    }

    /* Top control bar */
    .top-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.25);
    }
    .top-toolbar .title {
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .top-toolbar .actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .top-btn {
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
      transition: all 0.15s;
    }
    .top-btn-primary {
      background: #0284c7;
      color: #fff;
    }
    .top-btn-primary:hover {
      background: #0369a1;
    }
    .top-btn-outline {
      background: rgba(255,255,255,0.12);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .top-btn-outline:hover {
      background: rgba(255,255,255,0.2);
    }

    /* Print Document Header */
    .doc-header {
      border-bottom: 2px solid #0f3460;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .doc-org {
      font-size: 11pt;
      font-weight: bold;
      color: #0f3460;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .doc-title {
      font-size: 19pt;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0 2px;
    }
    .doc-subtitle {
      font-size: 9pt;
      color: #64748b;
    }
    .doc-serial {
      text-align: right;
      font-size: 8.5pt;
      color: #475569;
      font-family: monospace;
    }
    .doc-serial .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0369a1;
      font-weight: bold;
      font-size: 8.5pt;
      margin-bottom: 4px;
    }

    /* Info Grid */
    .info-grid-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9pt;
      border: 1px solid #cbd5e1;
    }
    .info-grid-table th {
      background: #f1f5f9;
      color: #334155;
      padding: 6px 10px;
      text-align: left;
      font-weight: 600;
      width: 13%;
      border: 1px solid #cbd5e1;
    }
    .info-grid-table td {
      padding: 6px 10px;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      width: 20%;
    }

    /* Executive Score Card */
    .summary-card {
      display: flex;
      border: 2px solid #0f3460;
      border-radius: 6px;
      background: #f8fafc;
      margin-bottom: 18px;
      overflow: hidden;
    }
    .summary-score {
      background: #0f3460;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 150px;
    }
    .summary-score .val {
      font-size: 30pt;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -1px;
    }
    .summary-score .lbl {
      font-size: 8pt;
      opacity: 0.85;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }
    .summary-details {
      padding: 10px 18px;
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px 12px;
      align-items: center;
      font-size: 9pt;
    }
    .summary-item .item-title {
      font-size: 8pt;
      color: #64748b;
      margin-bottom: 2px;
    }
    .summary-item .item-value {
      font-weight: 700;
      color: #0f172a;
    }
    .summary-item .highlight-tier {
      color: #0369a1;
      font-size: 10pt;
    }

    /* Section Headings */
    .sec-header {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f3460;
      border-left: 4px solid #0f3460;
      padding-left: 8px;
      margin: 16px 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .sec-sub {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: normal;
    }

    /* Tables */
    .formal-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 8.5pt;
      border: 1px solid #94a3b8;
    }
    .formal-table th {
      background: #f1f5f9;
      color: #1e293b;
      padding: 6px 8px;
      font-weight: 700;
      border: 1px solid #94a3b8;
      text-align: center;
    }
    .formal-table td {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
      color: #1e293b;
    }
    .formal-table tr:nth-child(even) {
      background: #fdfdfd;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }

    .tag-tier {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: 600;
    }
    .tag-exceed { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .tag-meet { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    .tag-below { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }

    /* Narrative / Comments */
    .comment-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      margin-bottom: 8px;
      background: #fff;
    }
    .comment-card-header {
      background: #f8fafc;
      padding: 5px 10px;
      font-weight: 700;
      font-size: 8.5pt;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
    }
    .comment-card-body {
      padding: 8px 10px;
      font-size: 8.5pt;
      color: #334155;
      min-height: 40px;
      white-space: pre-wrap;
      line-height: 1.5;
    }

    /* Signature Sign-off Table */
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      font-size: 8.5pt;
      border: 1.5px solid #0f3460;
    }
    .sig-table th {
      background: #f1f5f9;
      color: #0f3460;
      font-weight: 700;
      padding: 6px;
      border: 1px solid #cbd5e1;
      text-align: center;
      width: 20%;
    }
    .sig-table td {
      border: 1px solid #cbd5e1;
      padding: 10px 8px;
      text-align: center;
      height: 64px;
      vertical-align: bottom;
    }
    .sig-name {
      font-weight: 700;
      font-size: 9pt;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .sig-stamp {
      font-size: 7.5pt;
      color: #059669;
      background: #ecfdf5;
      border: 1px dashed #059669;
      padding: 2px 4px;
      border-radius: 3px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .sig-date {
      font-size: 7.5pt;
      color: #64748b;
    }

    .doc-footer {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }
  </style>
</head>
<body>

  <!-- Top Action Bar (Hidden on Print) -->
  <div class="top-toolbar no-print">
    <div class="title">
      <span>📄</span>
      <span>${employee.name} (${employee.employeeNo}) 績效評核表 - 正式紙本／PDF 列印預覽</span>
    </div>
    <div class="actions">
      <span style="font-size:12px;color:#94a3b8">💡 建議於列印視窗勾選「背景圖形」以呈現最佳色彩</span>
      <button class="top-btn top-btn-primary" onclick="window.print()">
        🖨️ 列印 / 儲存為 PDF
      </button>
      <a href="/api/form/${form.id}/docx" class="top-btn top-btn-outline">
        📥 匯出 Word (.docx)
      </a>
      <a href="/form/${form.id}" class="top-btn top-btn-outline">
        ← 返回表單
      </a>
    </div>
  </div>

  <div style="height: 38px;" class="no-print"></div>

  <!-- Document Sheet -->
  <div class="doc-container">
    
    <!-- Document Header -->
    <div class="doc-header">
      <div>
        <div class="doc-org">${co?.name || "HONOR BMP"} 企業績效管理系統</div>
        <div class="doc-title">${new Date().getFullYear()} 年度員工績效評核表</div>
        <div class="doc-subtitle">評核週期：${form.cycleId}・正式留存聯／董事長核決聯</div>
      </div>
      <div class="doc-serial">
        <div class="badge">${STATUS_LABEL[form.status]}</div>
        <div>單號：FORM-${form.id.toUpperCase()}</div>
        <div>產生日期：${printTime}</div>
      </div>
    </div>

    <!-- Employee Basic Information Table -->
    <table class="info-grid-table">
      <tbody>
        <tr>
          <th>受評員工</th>
          <td><strong>${employee.name}</strong></td>
          <th>員工工號</th>
          <td><code>${employee.employeeNo}</code></td>
          <th>所屬職稱</th>
          <td>${employee.title}</td>
        </tr>
        <tr>
          <th>所屬公司</th>
          <td>${co?.name || "—"}</td>
          <th>所屬部門</th>
          <td>${dept?.name || "—"}</td>
          <th>到職日期</th>
          <td>${employee.hireDate}</td>
        </tr>
        <tr>
          <th>初評主管</th>
          <td>${primary ? `${primary.name} (${primary.title})` : "—"}</td>
          <th>複評主管</th>
          <td>${secondary ? `${secondary.name} (${secondary.title})` : "—"}</td>
          <th>最終核決</th>
          <td>董事長</td>
        </tr>
      </tbody>
    </table>

    <!-- Executive Score & Ranking Summary Card -->
    <div class="summary-card avoid-break">
      <div class="summary-score">
        <div class="val">${total}</div>
        <div class="lbl">綜合總評得分 / 100</div>
      </div>
      <div class="summary-details">
        <div class="summary-item">
          <div class="item-title">（一）個人目標項目得分</div>
          <div class="item-value">${goalSubtotal.toFixed(1)} / 75 分</div>
        </div>
        <div class="summary-item">
          <div class="item-title">（二）行為指標項目得分</div>
          <div class="item-value">${fixedSubtotal.toFixed(1)} / 25 分</div>
        </div>
        <div class="summary-item">
          <div class="item-title">加減分調整</div>
          <div class="item-value">${form.bonusMalus >= 0 ? "+" : ""}${form.bonusMalus} 分</div>
        </div>
        <div class="summary-item" style="grid-column: span 3; border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 2px;">
          <div class="item-title">最終核定等第（年度考績）</div>
          <div class="item-value highlight-tier">
            ${form.rankingTier ? `🏆 ${RANKING_LABELS[form.rankingTier]}` : "⏳ 待複評／核決主管評定等第"}
            ${form.rankingOverrideReason ? `<span style="font-size:8pt;color:#64748b;font-weight:normal;margin-left:8px;">(調整原因：${form.rankingOverrideReason})</span>` : ""}
          </div>
        </div>
      </div>
    </div>

    <!-- Section 1: KPI Goals (75%) -->
    <div class="avoid-break">
      <div class="sec-header">
        <span>（一）個人化目標項目（占總分 75%）</span>
        <span class="sec-sub">依年度工作指標由受評人自評，主管初評核定</span>
      </div>
      <table class="formal-table">
        <thead>
          <tr>
            <th style="width: 5%;">項次</th>
            <th style="width: 22%; text-align: left;">工作目標與關鍵成果 (KPI)</th>
            <th style="width: 33%; text-align: left;">達標定義與衡量標準</th>
            <th style="width: 8%;">配分</th>
            <th style="width: 12%;">自評等第</th>
            <th style="width: 12%;">初評等第</th>
            <th style="width: 8%;">實得分</th>
          </tr>
        </thead>
        <tbody>
          ${form.goalItems
            .map(
              (item) => `
          <tr>
            <td class="text-center font-semibold">${item.order}</td>
            <td class="text-left"><strong>${item.title || "—"}</strong></td>
            <td class="text-left" style="color:#475569;">${item.standardDesc || "—"}</td>
            <td class="text-center font-semibold">${item.weight}%</td>
            <td class="text-center">
              ${item.selfTier ? `<span class="tag-tier tag-${item.selfTier}">${TIER_LABEL[item.selfTier]}</span>` : "—"}
            </td>
            <td class="text-center">
              ${item.primaryTier ? `<span class="tag-tier tag-${item.primaryTier}">${TIER_LABEL[item.primaryTier]}</span>` : "—"}
            </td>
            <td class="text-center font-bold" style="color:#0f3460;">${goalItemScore(item)}</td>
          </tr>`
            )
            .join("")}
          <tr style="background:#f8fafc; font-weight: bold;">
            <td colspan="3" class="text-right">目標項目配分與得分合計：</td>
            <td class="text-center">${form.goalItems.reduce((s, i) => s + i.weight, 0)}%</td>
            <td colspan="2"></td>
            <td class="text-center" style="color:#0f3460;">${goalSubtotal.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 2: Fixed Behavioral Competencies (25%) -->
    <div class="avoid-break">
      <div class="sec-header">
        <span>（二）公司核心職能與行為指標（占總分 25%）</span>
        <span class="sec-sub">包含誠信、當責、專業、創新、團隊合作等共通職能</span>
      </div>
      <table class="formal-table">
        <thead>
          <tr>
            <th style="width: 8%;">項次</th>
            <th style="width: 32%; text-align: left;">行為指標與職能要求</th>
            <th style="width: 16%;">基準配分</th>
            <th style="width: 16%;">員工自評</th>
            <th style="width: 16%;">主管初評</th>
            <th style="width: 12%;">實得分</th>
          </tr>
        </thead>
        <tbody>
          ${form.fixedItems
            .map(
              (item, idx) => `
          <tr>
            <td class="text-center font-semibold">${idx + 1}</td>
            <td class="text-left"><strong>${item.label}</strong></td>
            <td class="text-center">5 分（占 5%）</td>
            <td class="text-center">
              ${item.selfTier ? `<span class="tag-tier tag-${item.selfTier}">${TIER_LABEL[item.selfTier]}</span>` : "—"}
            </td>
            <td class="text-center">
              ${item.primaryTier ? `<span class="tag-tier tag-${item.primaryTier}">${TIER_LABEL[item.primaryTier]}</span>` : "—"}
            </td>
            <td class="text-center font-bold" style="color:#0f3460;">${fixedItemScore(item)}</td>
          </tr>`
            )
            .join("")}
          <tr style="background:#f8fafc; font-weight: bold;">
            <td colspan="2" class="text-right">行為項目配分與得分合計：</td>
            <td class="text-center">25 分</td>
            <td colspan="2"></td>
            <td class="text-center" style="color:#0f3460;">${fixedSubtotal.toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 3: Narrative & Feedback -->
    <div class="avoid-break">
      <div class="sec-header">
        <span>（三）意見回饋與主管職能發展評估</span>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="comment-card">
          <div class="comment-card-header">
            <span>👤 受評人・年度成長回顧</span>
          </div>
          <div class="comment-card-body">${form.selfFeedbackGrowth || "（尚未填寫）"}</div>
        </div>
        <div class="comment-card">
          <div class="comment-card-header">
            <span>🎯 受評人・明年度目標展望</span>
          </div>
          <div class="comment-card-body">${form.selfFeedbackNextYear || "（尚未填寫）"}</div>
        </div>
      </div>

      <div class="comment-card">
        <div class="comment-card-header">
          <span>👔 初評主管・績效面談綜合評語</span>
        </div>
        <div class="comment-card-body">${form.primaryComment || "（尚未填寫）"}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="comment-card">
          <div class="comment-card-header">
            <span>📈 複評主管・職務發展與晉升培育評估</span>
          </div>
          <div class="comment-card-body">${form.secondaryDevAssessment || "（尚未填寫）"}</div>
        </div>
        <div class="comment-card">
          <div class="comment-card-header">
            <span>📝 複評主管・綜合評核意見</span>
          </div>
          <div class="comment-card-body">${form.secondaryComment || "（尚未填寫）"}</div>
        </div>
      </div>
    </div>

    ${allCustomFields.length > 0 ? `
    <!-- Custom Template Fields -->
    <div class="avoid-break">
      <div class="sec-header">
        <span>（四）自訂評核專案欄位</span>
      </div>
      <table class="formal-table">
        <thead>
          <tr>
            <th style="width: 30%; text-align: left;">評核項目</th>
            <th style="text-align: left;">內容紀錄</th>
          </tr>
        </thead>
        <tbody>
          ${allCustomFields
            .map(
              (f) => `
          <tr>
            <td class="text-left font-semibold">${f.label}</td>
            <td class="text-left">${form.customFieldValues?.[f.id] || "—"}</td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    ` : ""}

    ${(form.attachments ?? []).length > 0 ? `
    <!-- Attachments List -->
    <div class="avoid-break">
      <div class="sec-header">
        <span>附件佐證資料清單</span>
      </div>
      <ul style="font-size: 8.5pt; color: #475569; padding-left: 18px; margin: 4px 0;">
        ${form.attachments.map((a) => `<li>📎 <strong>${a.fileName}</strong>（檔案大小：${a.fileSize}・上傳者：${a.uploaderName}・時間：${new Date(a.uploadedAt).toLocaleString("zh-TW")}）</li>`).join("")}
      </ul>
    </div>
    ` : ""}

    <!-- Section: Formal Multi-Party Signatures -->
    <div class="avoid-break">
      <div class="sec-header" style="margin-top: 20px;">
        <span>簽核與核決紀錄（公文留存欄）</span>
        <span class="sec-sub">請依序核簽或由系統電子憑證留存</span>
      </div>
      <table class="sig-table">
        <thead>
          <tr>
            <th>受評員工自評</th>
            <th>初評主管核簽</th>
            <th>複評主管核簽</th>
            <th>人力資源處覆核</th>
            <th>董事長 / 總經理核決</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="sig-name">${employee.name}</div>
              ${form.signatures.selfAt ? `<span class="sig-stamp">✓ 電子已簽</span><div class="sig-date">${new Date(form.signatures.selfAt).toLocaleDateString("zh-TW")}</div>` : `<div class="sig-date" style="color:#cbd5e1">（待簽署）</div>`}
            </td>
            <td>
              <div class="sig-name">${primary?.name || "—"}</div>
              ${form.signatures.primaryAt ? `<span class="sig-stamp">✓ 電子已簽</span><div class="sig-date">${new Date(form.signatures.primaryAt).toLocaleDateString("zh-TW")}</div>` : `<div class="sig-date" style="color:#cbd5e1">（待簽署）</div>`}
            </td>
            <td>
              <div class="sig-name">${secondary?.name || "—"}</div>
              ${form.signatures.secondaryAt ? `<span class="sig-stamp">✓ 電子已簽</span><div class="sig-date">${new Date(form.signatures.secondaryAt).toLocaleDateString("zh-TW")}</div>` : `<div class="sig-date" style="color:#cbd5e1">（待簽署）</div>`}
            </td>
            <td>
              <div class="sig-name">人資部覆核</div>
              ${form.signatures.approvedAt || form.status === "approved" ? `<span class="sig-stamp">✓ 覆核完成</span><div class="sig-date">${printTime.split(" ")[0]}</div>` : `<div class="sig-date" style="color:#cbd5e1">（待覆核）</div>`}
            </td>
            <td>
              <div class="sig-name">董事長</div>
              ${form.signatures.approvedAt ? `<span class="sig-stamp">★ 核決准予備查</span><div class="sig-date">${new Date(form.signatures.approvedAt).toLocaleDateString("zh-TW")}</div>` : `<div class="sig-date" style="color:#cbd5e1">（待核決）</div>`}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Document Footer -->
    <div class="doc-footer">
      <div>本評核表由 HONOR BMP 績效評核系統自動產出・文件等級：內部機密 (Confidential)</div>
      <div>列印時間：${printTime}・單號：FORM-${form.id.toUpperCase()}</div>
    </div>

  </div>

</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
