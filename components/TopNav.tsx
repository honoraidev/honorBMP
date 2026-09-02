import Link from "next/link";
import { Employee } from "@/lib/types";
import { formsAsPrimary, formsAsSecondary, getFormByEmployee } from "@/lib/store";
import { logout } from "@/app/login/actions";

export default function TopNav({ user }: { user: Employee | null }) {
  if (!user) return null;
  return (
    <header className="app-topbar sticky top-0 z-40 text-white">
      <div className="relative z-10 w-full pl-2 pr-4 md:pl-3 md:pr-8 lg:pl-4 lg:pr-12 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-lg shrink-0 transition-opacity hover:opacity-90">
          <img src="/logo.jpg" alt="丞石建築" className="h-16 w-16 -my-1 rounded-lg object-cover" />
          <span className="hidden sm:inline tracking-wide drop-shadow-sm">績效考核線上化系統</span>
          <span className="hidden sm:inline text-[11px] font-medium bg-white/15 ring-1 ring-white/25 rounded-full px-2.5 py-0.5 backdrop-blur-sm">雛形展示</span>
        </Link>
        {user && (
          <nav className="flex items-center gap-3 text-sm">
            <NavLinks user={user} />
            <div className="hidden md:flex items-center gap-2.5 rounded-full bg-white/10 ring-1 ring-white/15 pl-1.5 pr-3.5 py-1">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-teal text-xs font-bold shadow-sm">
                {user.name.slice(0, 1)}
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold">{user.name}</span>
                <span className="text-white/70 text-[11px]">{user.title}</span>
              </span>
            </div>
            <form action={logout}>
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-white/15 hover:border-white/60 transition"
                type="submit"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 12H3m0 0 4-4m-4 4 4 4M13 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6" />
                </svg>
                <span className="hidden sm:inline">登出</span>
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}

function NavLinks({ user }: { user: Employee }) {
  const myForm = getFormByEmployee(user.id);
  const primaryCount = formsAsPrimary(user.id).length;
  const secondaryCount = formsAsSecondary(user.id).length;
  return (
    <div className="hidden md:flex lg:hidden items-center gap-1">
      {myForm && (
        <Link href={`/form/${myForm.id}`} className="px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition">
          我的考核表
        </Link>
      )}
      {primaryCount > 0 && (
        <Link href="/review?role=primary" className="px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition">
          待我初評 <span className="ml-1 badge bg-white/20">{primaryCount}</span>
        </Link>
      )}
      {secondaryCount > 0 && (
        <Link href="/review?role=secondary" className="px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition">
          待我複評 <span className="ml-1 badge bg-white/20">{secondaryCount}</span>
        </Link>
      )}
      {user.isHrAdmin && (
        <Link href="/hr" className="px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition">
          人資彙整看板
        </Link>
      )}
      {!!user.approverCompanyIds?.length && (
        <Link href="/approve" className="px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition">
          核決中心
        </Link>
      )}
    </div>
  );
}
