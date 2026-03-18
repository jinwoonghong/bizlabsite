import Link from "next/link";
import PaperForm from "@/components/PaperForm";

export const metadata = {
  title: "Register Paper - Business Archive",
};

export default function NewPaperPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Link href="/" className="text-[10px] font-black uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100">
        &larr; Back to List
      </Link>

      <div className="mt-6 border-t-8 border-brand bg-bg">
        <div className="border-b border-border p-6 md:p-8">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
            논문 등록
          </h1>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-brand">
            Register New Paper
          </p>
        </div>
        <div className="p-6 md:p-8">
          <PaperForm mode="create" />
        </div>
      </div>
    </div>
  );
}
