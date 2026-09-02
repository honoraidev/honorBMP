"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { updateAvatar, removeAvatar, changePassword } from "@/app/profile/actions";

export type ProfileUser = {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
};

const AVATAR_SIZE = 160; // px, downscaled square before upload

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
    </svg>
  );
}

function Avatar({ url, className }: { url?: string; className?: string }) {
  return url ? (
    <img src={url} alt="頭像" className={`object-cover ${className}`} />
  ) : (
    <span className={`grid place-items-center bg-teal/10 text-teal ${className}`}>
      <PersonIcon className="h-[60%] w-[60%]" />
    </span>
  );
}

/** Downscale + center-crop an image file to a square JPEG data URL. */
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("讀取檔案失敗"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("無法解析這張圖片"));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("瀏覽器不支援圖片處理"));
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfileMenu({ user }: { user: ProfileUser }) {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [pwState, pwAction, pwPending] = useActionState(changePassword, null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("請選擇圖片檔案");
      return;
    }
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const res = await updateAvatar(dataUrl);
      if (res?.error) {
        setAvatarError(res.error);
      } else {
        setAvatarUrl(dataUrl);
      }
    } catch {
      setAvatarError("圖片處理失敗，請換一張試試");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onRemoveAvatar() {
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      await removeAvatar();
      setAvatarUrl(undefined);
    } finally {
      setAvatarBusy(false);
    }
  }

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 rounded-full bg-white/10 ring-1 ring-white/15 pl-1.5 pr-3.5 py-1 hover:bg-white/20 transition"
      >
        <Avatar url={avatarUrl} className="h-7 w-7 rounded-full shadow-sm" />
        <span className="hidden md:flex flex-col items-start leading-tight text-white">
          <span className="font-semibold">{user.name}</span>
          <span className="text-white/70 text-[11px]">{user.title}</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10">
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 text-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-navy">編輯個人資料</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="關閉"
                className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar url={avatarUrl} className="h-16 w-16 rounded-full ring-2 ring-teal/20 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400 mb-2">{user.title}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={avatarBusy}
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline !py-1.5 !px-3 text-xs disabled:opacity-50"
                    >
                      {avatarBusy ? "處理中…" : "上傳頭像"}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        disabled={avatarBusy}
                        onClick={onRemoveAvatar}
                        className="text-xs text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                      >
                        移除頭像
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                  {avatarError && <p className="text-xs text-red-600 mt-1">{avatarError}</p>}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Password */}
              <form action={pwAction} className="space-y-3">
                <h3 className="text-sm font-bold text-navy">變更密碼</h3>
                {pwState?.error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwState.error}</p>
                )}
                {pwState?.success && (
                  <p className="text-xs text-teal bg-teal/10 border border-teal/20 rounded-lg px-3 py-2">密碼已更新</p>
                )}
                <input
                  name="currentPassword"
                  type="password"
                  placeholder="目前密碼"
                  autoComplete="current-password"
                  required
                  className="input text-sm"
                />
                <input
                  name="newPassword"
                  type="password"
                  placeholder="新密碼"
                  autoComplete="new-password"
                  required
                  className="input text-sm"
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="確認新密碼"
                  autoComplete="new-password"
                  required
                  className="input text-sm"
                />
                <button type="submit" disabled={pwPending} className="btn btn-primary w-full text-sm disabled:opacity-50">
                  {pwPending ? "更新中…" : "更新密碼"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
