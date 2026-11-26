"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { EnclosureCard } from "@/components/EnclosureCard";
import { Enclosure } from "@/types/enclosure";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnclosures = useCallback(async () => {
    const res = await fetch("/api/enclosures");
    const data = await res.json();
    setEnclosures(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadEnclosures();
    }
  }, [status, loadEnclosures]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1">
        <h1 className="text-xl font-semibold mb-4">Вольеры</h1>

        {loading ? (
          <p className="text-gray-400">Загрузка вольеров...</p>
        ) : enclosures.length === 0 ? (
          <p className="text-gray-400">Пока нет вольеров. Добавьте их в админ-панели.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enclosures.map((enclosure) => (
              <EnclosureCard
                key={enclosure.id}
                enclosure={enclosure}
                onUpdate={loadEnclosures}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
