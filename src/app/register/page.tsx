"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!consent) {
      setError("Необходимо согласие на обработку персональных данных");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("consent", "on");
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await fetch("/api/register", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Ошибка регистрации");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-semibold mb-1">Регистрация</h1>
        <p className="text-sm text-gray-500 mb-6">Станьте волонтёром-выгульщиком</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Аватар"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center">
                  Фото
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <span className="text-sm text-gray-500">Необязательно</span>
          </div>

          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
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
            placeholder="Пароль (мин. 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />

          <label className="flex items-start gap-2 text-sm text-gray-600 mt-1">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Я согласен на обработку персональных данных в соответствии с{" "}
              <Link href="/privacy-policy" className="underline" target="_blank">
                политикой обработки персональных данных
              </Link>
            </span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 mt-2"
          >
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-gray-900 font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
