import { getStore, getDepartment, getCompany } from "@/lib/store";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const { employees, companies } = getStore();

  const keyRoles = [
    { label: "董事長（最終核決）", id: "p001" },
    { label: "特助（大可廣告核決）", id: "p002" },
    { label: "人資主任（看板管理）", id: "p035" },
    { label: "都更事業處執行長（主管初複評）", id: "p010" },
    { label: "業務協理（主管初複評）", id: "p015" },
    { label: "甜點餐飲主任（主管初複評）", id: "p054" },
    { label: "實習生 / 一般員工（自評）", id: "p007" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <img src="/logo.jpg" alt="丞石建築" className="inline-block h-20 w-20 rounded-2xl object-cover mb-4 shadow-md ring-1 ring-black/5" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-navy via-[#14857a] to-teal bg-clip-text text-transparent">丞石集團績效考核線上化系統</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          請使用您的員工工號與專屬密碼登入。系統將依據您在集團組織內的職務自動指派對應權限。
        </p>
      </div>

      <div className="max-w-md mx-auto mb-10">
        <LoginForm />
      </div>

      {/* Role and account reference list */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <details className="card p-4 text-sm bg-slate-50 border border-slate-200">
          <summary className="font-semibold text-navy cursor-pointer select-none flex items-center justify-between">
            <span>🔑 常用測試帳號與密碼對照（點擊展開）</span>
            <span className="text-xs text-teal font-normal">快速參考</span>
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 bg-gray-100/60">
                  <th className="py-2 px-3">角色身分</th>
                  <th className="py-2 px-3">工號</th>
                  <th className="py-2 px-3">姓名</th>
                  <th className="py-2 px-3 font-mono">預設密碼</th>
                  <th className="py-2 px-3">系統權限</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keyRoles.map(({ label, id }) => {
                  const emp = employees.find((e) => e.id === id);
                  if (!emp) return null;
                  const dept = getDepartment(emp.departmentId);
                  return (
                    <tr key={emp.id} className="hover:bg-white/80">
                      <td className="py-2 px-3 font-medium text-gray-800">{label}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-navy">{emp.employeeNo}</td>
                      <td className="py-2 px-3">{emp.name}</td>
                      <td className="py-2 px-3 font-mono text-teal font-semibold select-all">{emp.password}</td>
                      <td className="py-2 px-3 text-gray-500">{dept?.name}・{emp.title}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>

        <details className="card p-4 text-sm bg-slate-50 border border-slate-200">
          <summary className="font-semibold text-gray-700 cursor-pointer select-none flex items-center justify-between">
            <span>📋 全集團 96 位員工帳密清單（依公司分類）</span>
            <span className="text-xs text-gray-400">96 筆完整名冊</span>
          </summary>
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-1">
            {companies.map((co) => {
              const coEmps = employees.filter((e) => e.companyId === co.id);
              return (
                <div key={co.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <h3 className="font-bold text-navy text-xs mb-2">{co.name}（{coEmps.length} 人）</h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {coEmps.map((emp) => {
                      const dept = getDepartment(emp.departmentId);
                      return (
                        <div key={emp.id} className="p-2 border border-gray-100 rounded bg-gray-50/50 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-gray-800">{emp.name}</span>
                            <span className="text-gray-400 ml-1">({emp.employeeNo})</span>
                            <div className="text-[11px] text-gray-500">{dept?.name}・{emp.title}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-teal font-semibold text-xs select-all">{emp.password}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
}
