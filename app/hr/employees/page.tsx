import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore, getCompany, getDepartment, isHrCreatedEmployee } from "@/lib/store";
import { createEmployeeAction, deleteEmployeeAction, batchImportEmployeesAction } from "./actions";

export default async function HrEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string; imported?: string; error?: string; q?: string }>;
}) {
  const { created, deleted, imported, error, q } = await searchParams;
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  if (!user.isHrAdmin) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限人資角色檢視。</div>;
  }

  const { employees, departments, companies } = getStore();
  
  const query = (q || "").trim().toLowerCase();
  const filteredRoster = [...employees]
    .filter((e) => {
      if (!query) return true;
      const dept = getDepartment(e.departmentId);
      const co = getCompany(e.companyId);
      return (
        e.name.toLowerCase().includes(query) ||
        e.employeeNo.toLowerCase().includes(query) ||
        e.title.toLowerCase().includes(query) ||
        dept?.name.toLowerCase().includes(query) ||
        co?.name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.employeeNo.localeCompare(b.employeeNo));

  const reviewerOptions = [...employees].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">人員管理與資料庫匯入</h1>
          <p className="text-sm text-gray-500 mt-1">
            即時管理公司人員、維護資料庫名冊，並可批次匯入或直接刪除人員。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hr" className="btn btn-outline">← 回彙整看板</Link>
        </div>
      </div>

      {created && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>✅ 已成功建立人員「<strong>{created}</strong>」，預設密碼為 <span className="font-mono font-semibold">1</span>，並已自動產生本期考核表。</span>
        </div>
      )}
      {imported && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>🎉 資料庫批次匯入完成！已成功新增 <strong>{imported}</strong> 位人員並產生對應考核表。</span>
        </div>
      )}
      {deleted && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>🗑️ 人員已自名冊與資料庫中刪除移除。</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          ❌ 操作失敗：{error}
        </div>
      )}

      {/* Grid: Create Single & Batch Import */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Single Add */}
        <div className="lg:col-span-7">
          <form action={createEmployeeAction} className="card p-5 space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-bold text-navy flex items-center gap-2">
                <span>👤</span> 新增單一員工
              </h2>
              <span className="text-xs text-gray-400">寫入資料庫並同步建立考核表</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="姓名" required>
                <input name="name" required className="input" placeholder="例：王大明" />
              </Field>
              <Field label="工號" required>
                <input name="employeeNo" required className="input font-mono" placeholder="例：SYS-101" />
              </Field>
              <Field label="職稱" required>
                <input name="title" required className="input" placeholder="例：資深工程師" />
              </Field>
              <Field label="所屬部門" required>
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
                <input name="password" className="input font-mono" placeholder="留空預設為 1" />
              </Field>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500">權限指派（選填）</p>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="isHrAdmin" className="rounded text-navy focus:ring-navy" />
                <span>人資管理權限（可使用人資看板、人員管理、表單客製）</span>
              </label>
              <div className="text-sm text-gray-700">
                <span className="block mb-1 text-xs font-medium text-gray-500">核決權限：</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {companies.map((co) => (
                    <label key={co.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" name="approverCompanyIds" value={co.id} className="rounded text-navy" />
                      {co.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                ➕ 建立人員並產生考核表
              </button>
            </div>
          </form>
        </div>

        {/* Batch Import */}
        <div className="lg:col-span-5">
          <form action={batchImportEmployeesAction} className="card p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="font-bold text-navy flex items-center gap-2">
                  <span>📥</span> 資料庫批次匯入 (CSV / 貼上)
                </h2>
                <span className="text-xs text-teal font-medium">支援多筆匯入</span>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                可直接貼上試算表 (Excel/Sheets) 複製之內容，或 CSV 格式。每行一位員工。<br />
                <span className="font-semibold text-gray-700">格式：</span>
                <code className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-navy block mt-1 font-mono">
                  姓名,工號,職稱,部門代碼或名稱,初評主管(選填),複評主管(選填)
                </code>
              </p>

              <div className="mt-3">
                <textarea
                  name="importData"
                  rows={6}
                  required
                  placeholder={`陳大文, SYS-098, 工程師, 資訊工程處, 蕭博任, 林永昌\n李小華, SYS-099, 專員, 人力資源處\n張美玲, SYS-100, 會計師, 財務部`}
                  className="input font-mono text-xs w-full leading-5 resize-y"
                />
              </div>

              <p className="text-[11px] text-gray-400 mt-2">
                💡 部門名稱可填寫如「資訊工程處」或代碼「d-sys-eng」；主管可填寫姓名或工號。
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button type="submit" className="btn btn-secondary w-full">
                🚀 批次匯入人員至資料庫
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Roster & Management */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-navy text-lg">
              現有人員名冊與資料庫狀態（共 {employees.length} 位）
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              可直接刪減人員。刪除後該人員帳號將自名冊中移除並同步更新資料庫。
            </p>
          </div>

          {/* Search bar */}
          <form method="GET" className="flex items-center gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="搜尋姓名、工號、部門..."
              className="input text-xs py-1.5 px-3 w-52"
            />
            <button type="submit" className="btn btn-outline text-xs py-1.5 px-3">
              搜尋
            </button>
            {q && (
              <Link href="/hr/employees" className="text-xs text-gray-400 hover:text-gray-600">
                清除
              </Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full text-sm min-w-[780px]">
            <thead className="bg-gray-50 text-gray-600 text-xs font-semibold">
              <tr>
                <th className="text-left px-3 py-2.5">工號</th>
                <th className="text-left px-3 py-2.5">姓名</th>
                <th className="text-left px-3 py-2.5">職稱</th>
                <th className="text-left px-3 py-2.5">公司／部門</th>
                <th className="text-left px-3 py-2.5">初評 / 複評主管</th>
                <th className="text-left px-3 py-2.5">權限角色</th>
                <th className="text-center px-3 py-2.5 w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRoster.map((e) => {
                const co = getCompany(e.companyId);
                const dept = getDepartment(e.departmentId);
                const primary = e.primaryReviewerId ? employees.find((x) => x.id === e.primaryReviewerId) : null;
                const secondary = e.secondaryReviewerId ? employees.find((x) => x.id === e.secondaryReviewerId) : null;
                const roles = [
                  e.isHrAdmin ? "人資" : null,
                  e.approverCompanyIds?.length ? "核決" : null,
                ].filter(Boolean);
                const isCurrentUser = e.id === user.id;

                return (
                  <tr key={e.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{e.employeeNo}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">
                      {e.name}
                      {isCurrentUser && (
                        <span className="ml-1.5 badge bg-blue-50 text-navy border border-navy/20 text-[10px]">
                          您
                        </span>
                      )}
                      {isHrCreatedEmployee(e.id) && (
                        <span className="ml-1.5 badge bg-teal/10 text-teal text-[10px]">自建</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{e.title}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">
                      {co?.name} ／ <span className="text-gray-700">{dept?.name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">
                      {primary?.name || "—"} / {secondary?.name || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">
                      {roles.length > 0 ? (
                        <div className="flex gap-1">
                          {roles.map((r) => (
                            <span key={r} className="badge bg-navy/10 text-navy text-[10px] px-1.5 py-0.5">
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {isCurrentUser ? (
                        <span className="text-[11px] text-gray-400 cursor-not-allowed" title="不能刪除當前登入帳號">
                          保護中
                        </span>
                      ) : (
                        <form action={deleteEmployeeAction} className="inline">
                          <input type="hidden" name="employeeId" value={e.id} />
                          <button
                            type="submit"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs transition font-medium"
                            title={`刪除人員 ${e.name} (${e.employeeNo})`}
                          >
                            🗑️ 刪除
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRoster.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                    查無符合「{query}」的人員資料
                  </td>
                </tr>
              )}
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
      <span className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
