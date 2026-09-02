"use client";

import { useActionState, useEffect, useRef } from "react";
import type { HandbookEntry } from "@/lib/handbook";
import { addNoteAction, addFileAction, deleteEntryAction } from "@/app/handbook/actions";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 10);
}

export default function HandbookEditor({
  manualSlug,
  sectionSlug,
  entries,
  canEdit,
}: {
  manualSlug: string;
  sectionSlug: string;
  entries: HandbookEntry[];
  canEdit: boolean;
}) {
  const notes = entries.filter((e) => e.kind === "note");
  const files = entries.filter((e) => e.kind === "file");

  const [noteState, noteSubmit, notePending] = useActionState(addNoteAction, null);
  const [fileState, fileSubmit, filePending] = useActionState(addFileAction, null);
  const noteRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (noteState?.ok) noteRef.current?.reset();
  }, [noteState]);
  useEffect(() => {
    if (fileState?.ok) fileRef.current?.reset();
  }, [fileState]);

  if (!canEdit && notes.length === 0 && files.length === 0) return null;

  return (
    <div className="space-y-6">
      {notes.length > 0 && (
        <div className="pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">章節補充</h2>
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{n.text}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>由 {n.createdBy}・{fmtDate(n.createdAt)}</span>
                  {canEdit && <DeleteButton id={n.id} manualSlug={manualSlug} sectionSlug={sectionSlug} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">同仁新增文件</h2>
          <div className="space-y-3">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-teal" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3h6l5 5v13H5V3z" />
                  <path d="M14 3v5h5" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {f.fileSize}　由 {f.createdBy}・{fmtDate(f.createdAt)}
                  </p>
                </div>
                <a
                  href={`/handbook/file/${f.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-teal text-xs !py-1.5"
                >
                  開啟
                </a>
                {canEdit && <DeleteButton id={f.id} manualSlug={manualSlug} sectionSlug={sectionSlug} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {canEdit && (
        <div className="pt-2 border-t border-gray-100 space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">新增內容（主管）</h2>

          <form ref={noteRef} action={noteSubmit} className="space-y-2">
            <input type="hidden" name="manualSlug" value={manualSlug} />
            <input type="hidden" name="sectionSlug" value={sectionSlug} />
            <textarea
              name="text"
              rows={3}
              required
              placeholder="補充說明、注意事項、內部規定…"
              className="input text-sm w-full"
            />
            {noteState?.error && <p className="text-xs text-red-600">{noteState.error}</p>}
            <button type="submit" disabled={notePending} className="btn btn-outline text-xs disabled:opacity-50">
              {notePending ? "新增中…" : "新增補充說明"}
            </button>
          </form>

          <form ref={fileRef} action={fileSubmit} className="space-y-2">
            <input type="hidden" name="manualSlug" value={manualSlug} />
            <input type="hidden" name="sectionSlug" value={sectionSlug} />
            <input
              type="file"
              name="file"
              required
              className="block text-sm text-gray-600 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold hover:file:bg-gray-50"
            />
            <p className="text-xs text-gray-400">單一檔案上限 10MB，建議 PDF。</p>
            {fileState?.error && <p className="text-xs text-red-600">{fileState.error}</p>}
            <button type="submit" disabled={filePending} className="btn btn-outline text-xs disabled:opacity-50">
              {filePending ? "上傳中…" : "上傳檔案"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function DeleteButton({
  id,
  manualSlug,
  sectionSlug,
}: {
  id: string;
  manualSlug: string;
  sectionSlug: string;
}) {
  const [state, submit, pending] = useActionState(deleteEntryAction, null);
  return (
    <form action={submit} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="manualSlug" value={manualSlug} />
      <input type="hidden" name="sectionSlug" value={sectionSlug} />
      <button
        type="submit"
        disabled={pending}
        className="text-gray-400 hover:text-red-500 transition disabled:opacity-50"
        title={state?.error || "刪除"}
      >
        {pending ? "刪除中…" : "刪除"}
      </button>
    </form>
  );
}
