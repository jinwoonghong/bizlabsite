"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminPasswordModal from "@/components/AdminPasswordModal";

interface PaperActionsProps {
  paperId: number;
}

export default function PaperActions({ paperId }: PaperActionsProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(password: string) {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/papers/${paperId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 204) {
        router.push("/");
        router.refresh();
        return;
      }
      const data = await res.json();
      setDeleteError(res.status === 401 ? (data.error || "비밀번호가 올바르지 않습니다.") : (data.error || "삭제 중 오류가 발생했습니다."));
    } catch {
      setDeleteError("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mt-8 flex gap-3">
        <Link
          href={`/papers/${paperId}/edit`}
          className="rounded-sm border-2 border-text/20 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:border-text hover:bg-text hover:text-white"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => { setDeleteError(""); setShowDeleteModal(true); }}
          className="rounded-sm border-2 border-red-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white"
        >
          Delete
        </button>
      </div>

      <AdminPasswordModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="논문 삭제"
        description="이 논문을 삭제하려면 관리자 비밀번호를 입력하세요. 삭제된 논문은 복구할 수 없습니다."
        error={deleteError}
        isLoading={isDeleting}
      />
    </>
  );
}
