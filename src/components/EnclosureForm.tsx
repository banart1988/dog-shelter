"use client";

import { useState } from "react";
import { Dog } from "@/types/enclosure";

type DogDraft = { name: string; photoUrl: string | null; uploading?: boolean };

type Props = {
  initial?: {
    id?: string;
    name: string;
    groupName: string;
    comment: string;
    photoUrl: string | null;
    dogs: Dog[];
  };
  onDone: () => void;
  onCancel: () => void;
};

export function EnclosureForm({ initial, onDone, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [groupName, setGroupName] = useState(initial?.groupName ?? "");
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photoUrl ?? null);
  const [dogs, setDogs] = useState<DogDraft[]>(
    initial?.dogs.map((d) => ({ name: d.name, photoUrl: d.photoUrl })) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  function addDog() {
    setDogs((prev) => [...prev, { name: "", photoUrl: null }]);
  }

  function removeDog(index: number) {
    setDogs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDogName(index: number, value: string) {
    setDogs((prev) => prev.map((d, i) => (i === index ? { ...d, name: value } : d)));
  }

  async function uploadDogPhoto(index: number, file: File) {
    setDogs((prev) => prev.map((d, i) => (i === index ? { ...d, uploading: true } : d)));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "dogs");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setDogs((prev) =>
      prev.map((d, i) => (i === index ? { ...d, photoUrl: data.url ?? d.photoUrl, uploading: false } : d))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Укажите название вольера");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("groupName", groupName.trim());
    formData.append("comment", comment.trim());
    if (photoFile) formData.append("photo", photoFile);
    formData.append("dogs", JSON.stringify(dogs.filter((d) => d.name.trim())));

    const url = initial?.id ? `/api/enclosures/${initial.id}` : "/api/enclosures";
    const method = initial?.id ? "PATCH" : "POST";

    const res = await fetch(url, { method, body: formData });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Ошибка сохранения");
      return;
    }

    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          {photoPreview ? (
            <img src={photoPreview} alt="Вольер" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center">
              Фото вольера
            </div>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </label>
        <span className="text-sm text-gray-500">Нажмите, чтобы загрузить фото вольера</span>
      </div>

      <div>
        <label className="text-sm text-gray-600 block mb-1">Название вольера</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Например: Вольер №3"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 block mb-1">Название группы собак (необязательно)</label>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Например: Крупные спокойные"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 block mb-1">Комментарий (необязательно)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-600">Собаки в вольере</label>
          <button type="button" onClick={addDog} className="text-sm text-gray-900 font-medium">
            + Добавить собаку
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {dogs.map((dog, index) => (
            <div key={index} className="flex items-center gap-2">
              <label className="cursor-pointer shrink-0">
                {dog.photoUrl ? (
                  <img src={dog.photoUrl} alt={dog.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-[10px]">
                    {dog.uploading ? "..." : "фото"}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadDogPhoto(index, file);
                  }}
                />
              </label>
              <input
                value={dog.name}
                onChange={(e) => updateDogName(index, e.target.value)}
                placeholder="Имя собаки"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeDog(index)}
                className="text-gray-400 hover:text-red-500 text-sm px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Сохраняем..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
