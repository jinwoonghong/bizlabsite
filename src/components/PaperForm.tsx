"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Paper } from "@/types/paper";

interface PaperFormProps {
  mode: "create" | "edit";
  initialData?: Paper;
}

export default function PaperForm({ mode, initialData }: PaperFormProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    authors: initialData?.authors ?? "",
    year: initialData?.year ?? currentYear,
    journal: initialData?.journal ?? "",
    link: initialData?.link ?? "",
    abstract: initialData?.abstract ?? "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "제목을 입력해주세요.";
    if (!formData.authors.trim()) newErrors.authors = "저자를 입력해주세요.";
    if (!formData.year || isNaN(formData.year)) newErrors.year = "발행연도를 입력해주세요.";
    if (formData.link.trim()) {
      try { new URL(formData.link.trim()); } catch { newErrors.link = "올바른 URL을 입력해주세요."; }
    }
    if (mode === "edit" && !formData.password.trim()) newErrors.password = "관리자 비밀번호를 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const url = mode === "create" ? "/api/papers" : `/api/papers/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const body: Record<string, unknown> = {
        title: formData.title.trim(),
        authors: formData.authors.trim(),
        year: Number(formData.year),
        journal: formData.journal.trim() || undefined,
        link: formData.link.trim() || undefined,
        abstract: formData.abstract.trim() || undefined,
        ...(mode === "edit" && { password: formData.password }),
      };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) { setErrors({ password: data.error || "비밀번호가 올바르지 않습니다." }); return; }
        if (data.errors) { setErrors(data.errors); return; }
        throw new Error(data.error || "오류가 발생했습니다.");
      }

      router.push(mode === "create" ? "/" : `/papers/${initialData?.id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "year" ? (value === "" ? "" : Number(value)) : value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
      {submitError && (
        <div className="flex items-center gap-3 border-l-4 border-red-600 bg-red-50 p-4 text-xs text-red-800">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {submitError}
        </div>
      )}

      {/* Title - Large Serif Input */}
      <div>
        <label htmlFor="title" className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
          Title <span className="text-brand">*</span>
        </label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
          className="w-full border-b-2 border-text/10 bg-transparent py-3 text-xl transition-colors placeholder:opacity-20 focus:border-brand focus:outline-none md:text-2xl"
          style={{ fontFamily: "var(--font-serif)" }}
          placeholder="Paper Title" />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Authors & Year - 2 Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        <div>
          <label htmlFor="authors" className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
            Authors <span className="text-brand">*</span>
          </label>
          <input type="text" id="authors" name="authors" value={formData.authors} onChange={handleChange}
            className="w-full border-b border-text/10 bg-transparent py-2 text-sm transition-colors focus:border-brand focus:outline-none"
            placeholder="Author1, Author2, et al." />
          {errors.authors && <p className="mt-1 text-xs text-red-600">{errors.authors}</p>}
        </div>
        <div>
          <label htmlFor="year" className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
            Year <span className="text-brand">*</span>
          </label>
          <input type="number" id="year" name="year" value={formData.year} onChange={handleChange}
            min={1900} max={currentYear + 1}
            className="w-full border-b border-text/10 bg-transparent py-2 text-sm transition-colors focus:border-brand focus:outline-none"
            style={{ fontFamily: "var(--font-mono)" }} />
          {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year}</p>}
        </div>
      </div>

      {/* Journal & URL */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        <div>
          <label htmlFor="journal" className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
            Journal / Conference
          </label>
          <input type="text" id="journal" name="journal" value={formData.journal} onChange={handleChange}
            className="w-full border-b border-text/10 bg-transparent py-2 text-sm transition-colors focus:border-brand focus:outline-none"
            placeholder="Journal Name" />
        </div>
        <div>
          <label htmlFor="link" className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
            URL
          </label>
          <input type="url" id="link" name="link" value={formData.link} onChange={handleChange}
            className="w-full border-b border-text/10 bg-transparent py-2 text-sm transition-colors focus:border-brand focus:outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
            placeholder="https://doi.org/..." />
          {errors.link && <p className="mt-1 text-xs text-red-600">{errors.link}</p>}
        </div>
      </div>

      {/* Abstract */}
      <div>
        <label htmlFor="abstract" className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
          Abstract
        </label>
        <textarea id="abstract" name="abstract" value={formData.abstract} onChange={handleChange}
          rows={5}
          className="w-full border-b border-text/10 bg-transparent py-2 text-sm leading-relaxed transition-colors focus:border-brand focus:outline-none"
          placeholder="Paper abstract..." />
      </div>

      {/* Password (Edit Mode) */}
      {mode === "edit" && (
        <div className="border-t border-text/10 pt-6">
          <label htmlFor="password" className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
            Admin Password <span className="text-brand">*</span>
          </label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
            className="w-full border-b border-text/10 bg-transparent py-2 text-sm transition-colors focus:border-brand focus:outline-none"
            placeholder="관리자 비밀번호" />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-sm bg-brand py-4 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40 md:py-5"
      >
        {isSubmitting ? "Processing..." : mode === "create" ? "Register Paper" : "Update Paper"}
      </button>
    </form>
  );
}
