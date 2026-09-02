"use client";

import { useActionState } from "react";
import { loginWithCredentials } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginWithCredentials, null);

  return (
    <form action={formAction} className="card p-6 sm:p-8 space-y-5 shadow-lg border border-gray-100 bg-white">
      {state?.error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          工號 或 姓名
        </label>
        <input
          name="username"
          type="text"
          placeholder="例如：SYS-001 或 彭智祺"
          autoComplete="username"
          required
          autoFocus
          className="input w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm transition"
        />
        <p className="text-[11px] text-gray-400 mt-1">請輸入大寫工號（如 SYS-001 ~ SYS-096）或同仁姓名</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          個人登入密碼
        </label>
        <input
          name="password"
          type="password"
          placeholder="請輸入密碼"
          autoComplete="current-password"
          required
          className="input w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm transition"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full py-2.5 text-base font-semibold shadow-md disabled:opacity-50 transition"
      >
        {isPending ? "驗證中..." : "登入系統 →"}
      </button>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-400">
          如忘記密碼或工號有誤，請洽集團人資行政處協助。
        </p>
      </div>
    </form>
  );
}
