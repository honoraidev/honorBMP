"use client";

import { useState } from "react";
import type { HandbookAttachment } from "@/lib/handbook";

function fileHref(file?: string) {
  return file ? `/handbook/${file}` : undefined;
}

export default function AttachmentList({ items }: { items: HandbookAttachment[] }) {
  const [openFile, setOpenFile] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {items.map((a, i) => {
        const href = fileHref(a.file);
        const isOpen = openFile === a.file && !!a.file;
        return (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-teal" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3h6l5 5v13H5V3z" />
                <path d="M14 3v5h5" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.name}</p>
                <p className="text-xs text-gray-400">
                  {a.size ? `${a.size}` : ""}
                  {a.updatedAt ? `　更新：${a.updatedAt}` : ""}
                  {!a.file ? "　（尚未上傳）" : ""}
                </p>
              </div>
              {href ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenFile(isOpen ? null : a.file!)}
                    className="btn btn-outline text-xs !py-1.5"
                  >
                    {isOpen ? "收合" : "預覽"}
                  </button>
                  <a href={href} target="_blank" rel="noreferrer" className="btn btn-teal text-xs !py-1.5">
                    下載
                  </a>
                </>
              ) : (
                <span className="badge bg-gray-100 text-gray-400">無檔案</span>
              )}
            </div>
            {isOpen && href && (
              <iframe src={href} title={a.name} className="w-full h-[70vh] border-0 bg-white" />
            )}
          </div>
        );
      })}
    </div>
  );
}
