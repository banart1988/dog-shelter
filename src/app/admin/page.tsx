"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { EnclosureForm } from "@/components/EnclosureForm";
import { Enclosure } from "@/types/enclosure";

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/enclosures");
    setEnclosures(await res.json());
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  async function handleDelete(id: string) {
    if (!confirm("Удалить вольер?")) return;
    await fetch(`/api/enclosures/${id}`, { method: "DELETE" });
    load();
  }

  if (status !== "authenticated") return null;

  const editingEnclosure = enclosures.find((e) => e.id === editingId);

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="max-w-3xl w-full mx-auto px-4 py-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Админ-панель</h1>
          {!creating && !editingId && (
            <button
              onClick={() => setCreating(true)}
              className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2"
            >
              + Добавить вольер
            </button>
          )}
        </div>

        {creating && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <h2 className="font-semibold mb-4">Новый вольер</h2>
            <EnclosureForm
              onDone={() => {
                setCreating(false);
                load();
              }}
              onCancel={() => setCreating(false)}
            />
          </div>
        )}

        {editingEnclosure && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <h2 className="font-semibold mb-4">Редактирование: {editingEnclosure.name}</h2>
            <EnclosureForm
              initial={{
                id: editingEnclosure.id,
                name: editingEnclosure.name,
                groupName: editingEnclosure.groupName ?? "",
                comment: editingEnclosure.comment ?? "",
                photoUrl: editingEnclosure.photoUrl,
                dogs: editingEnclosure.dogs,
              }}
              onDone={() => {
                setEditingId(null);
                load();
              }}
              onCancel={() => setEditingId(null)}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {enclosures.map((enclosure) => (
            <div
              key={enclosure.id}
              className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{enclosure.name}</p>
                <p className="text-xs text-gray-500">
                  {enclosure.dogs.length} собак
                  {enclosure.caretaker ? ` · ${enclosure.caretaker.name}` : " · нет ответственного"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCreating(false);
                    setEditingId(enclosure.id);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(enclosure.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
