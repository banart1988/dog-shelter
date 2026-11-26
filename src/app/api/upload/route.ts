import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadPhoto } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) || "misc";

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const url = await uploadPhoto(file, folder);
  return NextResponse.json({ url });
}
