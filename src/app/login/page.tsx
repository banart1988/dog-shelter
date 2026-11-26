"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-semibold mb-1">Вход</h1>
        <p className="text-sm text-gray-500 mb-6">Приют — волонтёры-выгульщики</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 mt-2"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-gray-900 font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
