import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { id } = await params;
  const { comment } = await req.json();

  const enclosure = await prisma.enclosure.findUnique({ where: { id } });
  if (!enclosure) {
    return NextResponse.json({ error: "Вольер не найден" }, { status: 404 });
  }
  if (enclosure.caretakerId !== session.user.id) {
    return NextResponse.json({ error: "Вы не ответственный за этот вольер" }, { status: 403 });
  }

  await prisma.enclosure.update({
    where: { id },
    data: { comment: comment?.trim() || null },
  });

  return NextResponse.json({ success: true });
}
