import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { updateCyclePhases } from "../actions";

const FIELD_LABELS: { key: string; label: string }[] = [
  { key: "announce", label: "公告考核開始" },
  { key: "selfStart", label: "員工自評開始" },
  { key: "selfEnd", label: "員工自評截止" },
  { key: "primaryStart", label: "初評主管考核開始" },
  { key: "primaryEnd", label: "初評主管考核截止" },
  { key: "secondaryStart", label: "複評主管考核開始" },
  { key: "secondaryEnd", label: "複評主管考核截止" },
  { key: "hrDeadline", label: "考核表繳回人資期限" },
];

export default async function CycleSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");
  if (!user.isHrAdmin) {
    return <div className="card p-6 text-center text-sm text-gray-500">此頁僅限人資角色檢視。</div>;
  }
  const { cycle } = getStore();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">考核週期設定</h1>
        <p className="text-sm text-gray-500 mt-1">{cycle.label}</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          已儲存時程設定。
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg px-4 py-3">
        雛形展示說明：正式版將依此處設定之日期，自動開放／關閉對應角色的填寫權限。此雛形版本以「表單狀態」驅動流程（自評→初評→複評→彙整→核決），不強制依日期鎖定，方便隨時測試完整流程；日期僅作為看板顯示與提醒基準。
      </div>

      <form action={updateCyclePhases} className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FIELD_LABELS.map((f) => (
            <label key={f.key} className="block">
              <span className="block text-sm text-gray-600 mb-1">{f.label}</span>
              <input
                className="input"
                type="date"
                name={f.key}
                defaultValue={(cycle.phases as unknown as Record<string, string>)[f.key]}
              />
            </label>
          ))}
        </div>
        <div className="pt-2">
          <button type="submit" className="btn btn-primary">
            儲存設定
          </button>
        </div>
      </form>
    </div>
  );
}
