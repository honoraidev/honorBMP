import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { formsAsPrimary, formsAsSecondary, getEmployee, getDepartment, computeTotal } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";

export default async function ReviewListPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role: roleParam } = await searchParams;
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");

  const role = roleParam === "secondary" ? "secondary" : "primary";
  const forms = role === "primary" ? formsAsPrimary(user.id) : formsAsSecondary(user.id);
  const waitingStatus = role === "primary" ? "self" : "primary";

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">{role === "primary" ? "待我初評" : "待我複評"}</h1>
        <p className="text-sm text-gray-500 mt-1">共 {forms.length} 位人員</p>
      </div>

      <div className="flex gap-2 text-sm">
        <Link href="/review?role=primary" className={`btn ${role === "primary" ? "btn-primary" : "btn-outline"}`}>
          初評清單
        </Link>
        <Link href="/review?role=secondary" className={`btn ${role === "secondary" ? "btn-primary" : "btn-outline"}`}>
          複評清單
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-4 py-2.5">姓名</th>
              <th className="text-left px-4 py-2.5">職稱／部門</th>
              <th className="text-left px-4 py-2.5">狀態</th>
              <th className="text-right px-4 py-2.5">目前分數</th>
              <th className="text-right px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => {
              const emp = getEmployee(f.employeeId)!;
              const dept = getDepartment(emp.departmentId);
              const pending = f.status === waitingStatus;
              return (
                <tr key={f.id} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 font-medium">{emp.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {emp.title}・{dept?.name}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={f.status} />
                    {pending && <span className="ml-2 text-xs text-amber-600 font-semibold">待處理</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">{computeTotal(f)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/form/${f.id}`} className="text-navy font-semibold hover:underline">
                      檢視 →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {forms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  目前沒有待處理的考核表
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
