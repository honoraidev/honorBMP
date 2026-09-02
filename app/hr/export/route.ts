import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore, getEmployee, getDepartment, getCompany, computeTotal, STATUS_LABEL } from "@/lib/store";

export async function GET() {
  const user = await getCurrentEmployee();
  if (!user || !user.isHrAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const { forms, cycle } = getStore();

  const header = ["工號", "姓名", "職稱", "公司", "部門", "狀態", "合計分數", "排名等第", "初評主管", "複評主管"];
  const rows = forms.map((f) => {
    const emp = getEmployee(f.employeeId)!;
    const dept = getDepartment(emp.departmentId);
    const co = getCompany(emp.companyId);
    const primary = emp.primaryReviewerId ? getEmployee(emp.primaryReviewerId)?.name : "";
    const secondary = emp.secondaryReviewerId ? getEmployee(emp.secondaryReviewerId)?.name : "N/A";
    return [
      emp.employeeNo,
      emp.name,
      emp.title,
      co?.name || "",
      dept?.name || "",
      STATUS_LABEL[f.status],
      String(computeTotal(f)),
      f.rankingTier || "",
      primary || "",
      secondary || "",
    ];
  });

  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const bom = "﻿"; // ensure Excel opens UTF-8 Chinese text correctly
  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${cycle.year}年度考核彙整_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
