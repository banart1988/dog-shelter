import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadPhoto } from "@/lib/s3";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await req.formData();
  const name = (formData.get("name") as string | null)?.trim();
  const groupName = (formData.get("groupName") as string | null)?.trim() || null;
  const comment = (formData.get("comment") as string | null)?.trim() || null;
  const photo = formData.get("photo") as File | null;
  const dogsRaw = formData.get("dogs") as string | null;

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  data.groupName = groupName;
  data.comment = comment;

  if (photo && photo.size > 0) {
    data.photoUrl = await uploadPhoto(photo, "enclosures");
  }

  await prisma.enclosure.update({ where: { id }, data });

  if (dogsRaw) {
    const dogs: { id?: string; name: string; photoUrl?: string | null }[] = JSON.parse(dogsRaw);
    await prisma.dog.deleteMany({ where: { enclosureId: id } });
    await prisma.dog.createMany({
      data: dogs
        .filter((d) => d.name.trim())
        .map((d) => ({ enclosureId: id, name: d.name.trim(), photoUrl: d.photoUrl ?? null })),
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.enclosure.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
