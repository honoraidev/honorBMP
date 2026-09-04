import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
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

function cell(text: string, bold = false, shade?: string) {
  return new TableCell({
    shading: shade ? { fill: shade } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold, size: 18 })],
      }),
    ],
  });
}

function section(title: string) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "0f3460" },
    },
    children: [new TextRun({ text: title, bold: true, color: "0f3460", size: 22 })],
  });
}

function commentBlock(label: string, text: string) {
  return [
    new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18 })] }),
    new Paragraph({
      children: [new TextRun({ text: text || "（尚未填寫）", color: text ? "111827" : "9ca3af", size: 18 })],
      shading: { fill: "f9fafb" },
      spacing: { before: 60, after: 120 },
    }),
  ];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const user = await getCurrentEmployee();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const { formId } = await params;
  const form = getForm(formId);
  if (!form) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!canUserViewForm(user, form)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const employee = getEmployee(form.employeeId)!;
  const dept = getDepartment(employee.departmentId);
  const co = getCompany(employee.companyId);
  const primary = employee.primaryReviewerId ? getEmployee(employee.primaryReviewerId) : null;
  const secondary = employee.secondaryReviewerId ? getEmployee(employee.secondaryReviewerId) : null;
  const total = computeTotal(form);

  const templates = getTemplatesForEmployee(employee);
  const allCustomFields = templates.flatMap((t) => t.fields).sort((a, b) => a.order - b.order);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Microsoft JhengHei", size: 20 },
        },
      },
    },
    sections: [
      {
        children: [
          // 標題
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "績效評核表", bold: true, size: 36, color: "0f3460" }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${co?.name ?? ""} ・ ${dept?.name ?? ""}`, size: 20, color: "555555" }),
            ],
            spacing: { after: 200 },
          }),

          // 基本資料表格
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell("受評人", true, "eff6ff"),
                  cell(employee.name),
                  cell("職稱", true, "eff6ff"),
                  cell(employee.title),
                ],
              }),
              new TableRow({
                children: [
                  cell("工號", true, "eff6ff"),
                  cell(employee.employeeNo),
                  cell("到職日", true, "eff6ff"),
                  cell(employee.hireDate),
                ],
              }),
              new TableRow({
                children: [
                  cell("初評主管", true, "eff6ff"),
                  cell(primary?.name ?? "—"),
                  cell("複評主管", true, "eff6ff"),
                  cell(secondary?.name ?? "—"),
                ],
              }),
              new TableRow({
                children: [
                  cell("表單狀態", true, "eff6ff"),
                  cell(STATUS_LABEL[form.status]),
                  cell("合計分數", true, "eff6ff"),
                  cell(`${total} / 100${form.rankingTier ? `  ${RANKING_LABELS[form.rankingTier]}` : ""}`),
                ],
              }),
            ],
          }),

          // 目標項目
          section("（一）個人化目標項目（合計占75分）"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell("#", true, "e2e8f0"),
                  cell("項目標題", true, "e2e8f0"),
                  cell("達標定義", true, "e2e8f0"),
                  cell("配分", true, "e2e8f0"),
                  cell("自評", true, "e2e8f0"),
                  cell("初評", true, "e2e8f0"),
                  cell("得分", true, "e2e8f0"),
                ],
              }),
              ...form.goalItems.map(
                (item) =>
                  new TableRow({
                    children: [
                      cell(String(item.order)),
                      cell(item.title || "—"),
                      cell(item.standardDesc || "—"),
                      cell(String(item.weight)),
                      cell(item.selfTier ? TIER_LABEL[item.selfTier] : "—"),
                      cell(item.primaryTier ? TIER_LABEL[item.primaryTier] : "—"),
                      cell(String(goalItemScore(item))),
                    ],
                  })
              ),
            ],
          }),

          // 固定項目
          section("（二）公司統一行為項目（合計占25分）"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell("項目", true, "e2e8f0"),
                  cell("自評", true, "e2e8f0"),
                  cell("初評", true, "e2e8f0"),
                  cell("得分", true, "e2e8f0"),
                ],
              }),
              ...form.fixedItems.map(
                (item) =>
                  new TableRow({
                    children: [
                      cell(item.label),
                      cell(item.selfTier ? TIER_LABEL[item.selfTier] : "—"),
                      cell(item.primaryTier ? TIER_LABEL[item.primaryTier] : "—"),
                      cell(String(fixedItemScore(item))),
                    ],
                  })
              ),
            ],
          }),

          // 加減分
          section("（三）加減分與排名等第"),
          new Table({
            width: { size: 60, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell("加減分", true, "e2e8f0"),
                  cell(`${form.bonusMalus > 0 ? "+" : ""}${form.bonusMalus} 分`),
                ],
              }),
              new TableRow({
                children: [
                  cell("排名等第", true, "e2e8f0"),
                  cell(form.rankingTier ? RANKING_LABELS[form.rankingTier] : "尚未核定"),
                ],
              }),
            ],
          }),

          // 意見回饋
          section("（四）意見回饋"),
          ...commentBlock("員工回顧本年度成長", form.selfFeedbackGrowth),
          ...commentBlock("員工明年度目標", form.selfFeedbackNextYear),
          ...commentBlock("初評主管面談意見", form.primaryComment),
          ...commentBlock("複評主管職務發展評估", form.secondaryDevAssessment),
          ...commentBlock("複評主管評核意見", form.secondaryComment),

          // 自訂欄位
          ...(allCustomFields.length > 0
            ? [
                section("（五）自訂評核欄位"),
                ...allCustomFields.flatMap((field) =>
                  commentBlock(field.label + (field.required ? " *" : ""), form.customFieldValues?.[field.id] ?? "")
                ),
              ]
            : []),

          // 附件清單
          ...((form.attachments ?? []).length > 0
            ? [
                section("附件清單"),
                ...form.attachments.map(
                  (a) =>
                    new Paragraph({
                      children: [
                        new TextRun({ text: `📎 ${a.fileName}（${a.fileSize}・${a.uploaderName}・${new Date(a.uploadedAt).toLocaleDateString("zh-TW")}）`, size: 18 }),
                      ],
                    })
                ),
              ]
            : []),

          // 簽名欄
          section("簽名欄"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  cell("受評人", true, "f0f4f8"),
                  cell("初評主管", true, "f0f4f8"),
                  cell("複評主管", true, "f0f4f8"),
                  cell("核決", true, "f0f4f8"),
                ],
              }),
              new TableRow({
                children: [
                  cell(employee.name),
                  cell(primary?.name ?? "—"),
                  cell(secondary?.name ?? "—"),
                  cell("董事長"),
                ],
              }),
              new TableRow({
                children: [
                  cell(form.signatures.selfAt ? new Date(form.signatures.selfAt).toLocaleDateString("zh-TW") : "—"),
                  cell(form.signatures.primaryAt ? new Date(form.signatures.primaryAt).toLocaleDateString("zh-TW") : "—"),
                  cell(form.signatures.secondaryAt ? new Date(form.signatures.secondaryAt).toLocaleDateString("zh-TW") : "—"),
                  cell(form.signatures.approvedAt ? new Date(form.signatures.approvedAt).toLocaleDateString("zh-TW") : "—"),
                ],
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `匯出時間：${new Date().toLocaleString("zh-TW")}・系統自動產生`, size: 14, color: "aaaaaa" })],
            spacing: { before: 240 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(employee.name)}_績效評核表.docx"`,
    },
  });
}
