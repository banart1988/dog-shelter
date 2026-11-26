import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { id } = await params;

  const enclosure = await prisma.enclosure.findUnique({ where: { id } });
  if (!enclosure) {
    return NextResponse.json({ error: "Вольер не найден" }, { status: 404 });
  }
  if (enclosure.caretakerId) {
    return NextResponse.json({ error: "У вольера уже есть ответственный" }, { status: 409 });
  }

  await prisma.enclosure.update({
    where: { id },
    data: { caretakerId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
