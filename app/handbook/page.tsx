import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { HANDBOOK } from "@/lib/handbook";

export default async function HandbookIndexPage() {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-navy">員工手冊</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          各項制度規範與相關文件下載。點選手冊進入章節，右側可線上預覽 PDF 附件。
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {HANDBOOK.map((m) => (
          <Link key={m.slug} href={`/handbook/${m.slug}`} className="card card-hover p-5 block">
            <h2 className="font-bold text-navy mb-1">{m.title}</h2>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{m.summary}</p>
            <span className="text-xs font-semibold text-teal">
              {m.sections.length} 個章節・開啟 →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
