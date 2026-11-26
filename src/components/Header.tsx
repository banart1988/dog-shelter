"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "./Avatar";

export function Header() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900">
          🐾 Приют — волонтёры
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
            Админ-панель
          </Link>
          <div className="flex items-center gap-2">
            <Avatar
              name={session.user.name ?? "?"}
              photoUrl={session.user.image}
              size="sm"
            />
            <span className="text-sm text-gray-700 hidden sm:inline">
              {session.user.name}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
