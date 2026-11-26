"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "./Avatar";
import { Enclosure } from "@/types/enclosure";
import { getEnclosureStatus, STATUS_COLOR, formatDate } from "@/lib/status";

type Props = {
  enclosure: Enclosure;
  onUpdate: () => void;
};

export function EnclosureCard({ enclosure, onUpdate }: Props) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState(enclosure.comment ?? "");

  const lastWalk = enclosure.walks[0]?.walkedAt ?? null;
  const status = getEnclosureStatus(enclosure.caretakerId, lastWalk);
  const isMyEnclosure = enclosure.caretakerId === userId;
  const hasCaretaker = Boolean(enclosure.caretakerId);

  async function handleClaim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/enclosures/${enclosure.id}/claim`, { method: "POST" });
      if (res.ok) onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function handleWalk() {
    setLoading(true);
    try {
      const res = await fetch(`/api/enclosures/${enclosure.id}/walk`, { method: "POST" });
      if (res.ok) onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveComment() {
    setLoading(true);
    try {
      const res = await fetch(`/api/enclosures/${enclosure.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentDraft }),
      });
      if (res.ok) {
        setCommentOpen(false);
        onUpdate();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${STATUS_COLOR[status]}`} />

      {enclosure.comment && (
        <div
          className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-400 border border-white shadow z-10"
          title="Есть комментарий"
        />
      )}

      <div className="relative pl-1.5">
        <div className="relative h-40 bg-gray-100">
          {enclosure.photoUrl ? (
            <img
              src={enclosure.photoUrl}
              alt={enclosure.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Нет фото
            </div>
          )}

          {lastWalk && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow">
              <RunIcon />
              <span>{formatDate(lastWalk)}</span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{enclosure.name}</h3>
            {enclosure.groupName && (
              <p className="text-sm text-gray-500">{enclosure.groupName}</p>
            )}
          </div>

          {enclosure.dogs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {enclosure.dogs.map((dog) => (
                <div key={dog.id} className="flex flex-col items-center gap-1 w-14">
                  <Avatar name={dog.name} photoUrl={dog.photoUrl} size="sm" />
                  <span className="text-[11px] text-gray-600 text-center leading-tight truncate w-full">
                    {dog.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
            {enclosure.caretaker ? (
              <>
                <Avatar name={enclosure.caretaker.name} photoUrl={enclosure.caretaker.avatarUrl} size="sm" />
                <span className="text-sm text-gray-700 truncate">{enclosure.caretaker.name}</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">Нет ответственного</span>
            )}
          </div>

          {enclosure.comment && !commentOpen && (
            <div className="text-sm bg-yellow-50 text-yellow-800 rounded-lg px-3 py-2">
              {enclosure.comment}
            </div>
          )}

          {commentOpen && isMyEnclosure && (
            <div className="flex flex-col gap-2">
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none"
                rows={3}
                placeholder="Комментарий к вольеру..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveComment}
                  disabled={loading}
                  className="flex-1 bg-gray-900 text-white text-sm rounded-lg py-1.5 disabled:opacity-50"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setCommentOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 text-sm rounded-lg py-1.5"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!hasCaretaker && (
              <button
                onClick={handleClaim}
                disabled={loading}
                className="flex-1 bg-gray-900 text-white text-sm font-medium rounded-lg py-2 disabled:opacity-50"
              >
                Хочу выгуливать
              </button>
            )}

            {isMyEnclosure && (
              <>
                <button
                  onClick={handleWalk}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white text-sm font-medium rounded-lg py-2 disabled:opacity-50"
                >
                  Гуляли
                </button>
                {!commentOpen && (
                  <button
                    onClick={() => setCommentOpen(true)}
                    className="flex-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg py-2"
                  >
                    Комментарий
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="4" r="2" fill="white" />
      <path
        d="M14 7l-3 3 2 2-1 5M11 10l-4 1M13 12l3 2 3-1M8 14l-2 5M9 19l3-1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 16c1.5 1 3 1 4-1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
