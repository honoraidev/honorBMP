import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore, getCompany, getDepartment, isHrCreatedEmployee } from "@/lib/store";
import { createEmployeeAction } from "./actions";

export default async function HrEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const { created, error } = await searchParams;
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  if (!user.isHrAdmin) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限人資角色檢視。</div>;
  }

  const { employees, departments, companies } = getStore();
  const roster = [...employees].sort((a, b) => a.employeeNo.localeCompare(b.employeeNo));
  const reviewerOptions = [...employees].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">人員管理</h1>
          <p className="text-sm text-gray-500 mt-1">建立新進人員帳號，並自動產生本期考核表。</p>
        </div>
        <Link href="/hr" className="btn btn-outline">← 回彙整看板</Link>
      </div>

      {created && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          已建立人員「{created}」，預設密碼為 <span className="font-mono font-semibold">1</span>，並已產生本期考核表（待自評／目標設定）。
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          建立失敗：{error}
        </div>
      )}

      {/* Create form */}
      <form action={createEmployeeAction} className="card p-5 space-y-4">
        <h2 className="font-bold text-navy">新增人員</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="姓名" required>
            <input name="name" required className="input" placeholder="例：王小明" />
          </Field>
          <Field label="工號" required>
            <input name="employeeNo" required className="input" placeholder="例：SYS-097" />
          </Field>
          <Field label="職稱" required>
            <input name="title" required className="input" placeholder="例：專員" />
          </Field>
          <Field label="部門（公司自動帶入）" required>
            <select name="departmentId" required className="input" defaultValue="">
              <option value="" disabled>請選擇部門</option>
              {companies.map((co) => (
                <optgroup key={co.id} label={co.name}>
                  {departments
                    .filter((d) => d.companyId === co.id)
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="初評主管">
            <select name="primaryReviewerId" className="input" defaultValue="">
              <option value="">（暫不指定）</option>
              {reviewerOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}・{e.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="複評主管">
            <select name="secondaryReviewerId" className="input" defaultValue="">
              <option value="">（暫不指定）</option>
              {reviewerOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}・{e.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="登入密碼">
            <input name="password" className="input" placeholder="留空預設為 1" />
          </Field>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500">角色權限（選填）</p>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isHrAdmin" className="h-4 w-4" />
            人資管理權限（可進入彙整看板、週期設定、人員管理）
          </label>
          <div className="text-sm text-gray-700">
            <span className="block mb-1">核決權限（可核決下列公司的考核表）：</span>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {companies.map((co) => (
                <label key={co.id} className="flex items-center gap-2">
                  <input type="checkbox" name="approverCompanyIds" value={co.id} className="h-4 w-4" />
                  {co.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-1">
          <button type="submit" className="btn btn-primary">建立人員</button>
        </div>
      </form>

      {/* Roster */}
      <div className="card p-5">
        <h2 className="font-bold text-navy mb-4">現有人員（{roster.length}）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">工號</th>
                <th className="text-left px-3 py-2">姓名</th>
                <th className="text-left px-3 py-2">職稱</th>
                <th className="text-left px-3 py-2">公司／部門</th>
                <th className="text-left px-3 py-2">角色</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((e) => {
                const co = getCompany(e.companyId);
                const dept = getDepartment(e.departmentId);
                const roles = [
                  e.isHrAdmin ? "人資" : null,
                  e.approverCompanyIds?.length ? "核決" : null,
                ].filter(Boolean);
                return (
                  <tr key={e.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{e.employeeNo}</td>
                    <td className="px-3 py-2 font-medium">
                      {e.name}
                      {isHrCreatedEmployee(e.id) && (
                        <span className="ml-2 badge bg-teal/10 text-teal">新增</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{e.title}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {co?.name} ／ {dept?.name}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{roles.join("、") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
