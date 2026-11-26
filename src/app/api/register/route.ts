import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { uploadPhoto } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = (formData.get("name") as string | null)?.trim();
    const email = (formData.get("email") as string | null)?.trim().toLowerCase();
    const password = formData.get("password") as string | null;
    const consent = formData.get("consent") as string | null;
    const avatar = formData.get("avatar") as File | null;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Заполните имя, email и пароль" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
    }
    if (consent !== "on") {
      return NextResponse.json(
        { error: "Необходимо согласие на обработку персональных данных" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    let avatarUrl: string | null = null;
    if (avatar && avatar.size > 0) {
      avatarUrl = await uploadPhoto(avatar, "avatars");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, avatarUrl },
    });

    await prisma.consent.create({
      data: {
        userId: user.id,
        policyVersion: process.env.PRIVACY_POLICY_VERSION ?? "1.0",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Ошибка регистрации";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
