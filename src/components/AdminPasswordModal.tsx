"use client";

import { useState, useEffect, useRef } from "react";

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void | Promise<void>;
  title: string;
  description: string;
  error?: string;
  isLoading?: boolean;
}

export default function AdminPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  error,
  isLoading,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isLoading) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !isLoading) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    await onConfirm(password);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/80 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="mx-4 w-full max-w-md overflow-hidden bg-bg shadow-2xl">
        {/* Red Top Border */}
        <div className="h-2 bg-brand" />

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>{title}</h2>
              <p className="mt-1 text-xs opacity-50">{description}</p>
            </div>
            <button onClick={onClose} disabled={isLoading} className="p-1 opacity-30 transition-opacity hover:opacity-100 disabled:opacity-10">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
              Password
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              disabled={isLoading}
              className="w-full border-b-2 border-text/10 bg-transparent py-3 text-sm transition-colors focus:border-brand focus:outline-none disabled:opacity-50"
            />

            {error && (
              <div className="mt-3 flex items-center gap-2 border-l-4 border-red-600 bg-red-50 p-3 text-xs text-red-800">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-sm border-2 border-text/20 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:border-text hover:bg-text hover:text-white disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!password.trim() || isLoading}
                className="flex-1 rounded-sm bg-brand py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isLoading ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
