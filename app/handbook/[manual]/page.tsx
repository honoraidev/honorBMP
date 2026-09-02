import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentEmployee } from "@/lib/auth";
import { getManual, getSection } from "@/lib/handbook";
import AttachmentList from "@/components/AttachmentList";

export default async function ManualPage({
  params,
  searchParams,
}: {
  params: Promise<{ manual: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const user = await getCurrentEmployee();
  if (!user) redirect("/login");

  const { manual: manualSlug } = await params;
  const { s } = await searchParams;
  const manual = getManual(manualSlug);
  if (!manual) notFound();

  const section = getSection(manual, s);
  if (!section) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/handbook" className="hover:text-teal">員工手冊</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium">{manual.title}</span>
      </div>

      <div className="grid lg:grid-cols-[16rem_1fr] gap-5 items-start">
        {/* Section nav */}
        <nav className="card p-2 lg:sticky lg:top-20">
          {manual.sections.map((sec) => {
            const active = sec.slug === section.slug;
            return (
              <Link
                key={sec.slug}
                href={`/handbook/${manual.slug}?s=${sec.slug}`}
                className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-teal/10 text-teal font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {sec.title}
              </Link>
            );
          })}
        </nav>

        {/* Section content */}
        <div className="card p-6 space-y-5 min-w-0">
          <h1 className="text-lg font-bold text-navy">{section.title}</h1>

          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            {section.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {section.internalLinks && section.internalLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {section.internalLinks.map((l) => (
                <Link key={l.href} href={l.href} className="btn btn-outline text-xs">
                  {l.label} →
                </Link>
              ))}
            </div>
          )}

          {section.attachments && section.attachments.length > 0 && (
            <div className="pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                相關文件
              </h2>
              <AttachmentList items={section.attachments} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
