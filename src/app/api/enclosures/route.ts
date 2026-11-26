import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadPhoto } from "@/lib/s3";

export async function GET() {
  const enclosures = await prisma.enclosure.findMany({
    select: {
      id: true,
      name: true,
      photoUrl: true,
      groupName: true,
      comment: true,
      caretakerId: true,
      caretaker: {
        select: { id: true, name: true, avatarUrl: true },
      },
      dogs: {
        select: { id: true, name: true, photoUrl: true },
      },
      walks: {
        orderBy: { walkedAt: "desc" },
        take: 1,
        select: { id: true, walkedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(enclosures);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = (formData.get("name") as string | null)?.trim();
  const groupName = (formData.get("groupName") as string | null)?.trim() || null;
  const comment = (formData.get("comment") as string | null)?.trim() || null;
  const photo = formData.get("photo") as File | null;
  const dogsRaw = formData.get("dogs") as string | null;

  if (!name) {
    return NextResponse.json({ error: "Укажите название вольера" }, { status: 400 });
  }

  let photoUrl: string | null = null;
  if (photo && photo.size > 0) {
    photoUrl = await uploadPhoto(photo, "enclosures");
  }

  const enclosure = await prisma.enclosure.create({
    data: { name, groupName, comment, photoUrl },
  });

  if (dogsRaw) {
    const dogs: { name: string; photoUrl?: string | null }[] = JSON.parse(dogsRaw);
    await prisma.dog.createMany({
      data: dogs
        .filter((d) => d.name.trim())
        .map((d) => ({ enclosureId: enclosure.id, name: d.name.trim(), photoUrl: d.photoUrl ?? null })),
    });
  }

  return NextResponse.json({ success: true, id: enclosure.id });
}
