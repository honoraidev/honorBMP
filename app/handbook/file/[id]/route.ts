import { NextRequest } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import { getHandbookFile } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentEmployee();
  if (!user) return new Response("未登入", { status: 401 });

  const { id } = await params;
  const file = await getHandbookFile(id);
  if (!file) return new Response("找不到檔案", { status: 404 });

  const asciiName = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return new Response(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(
        file.name
      )}`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
