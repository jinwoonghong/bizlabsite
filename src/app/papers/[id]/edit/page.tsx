import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PaperForm from "@/components/PaperForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPaperPage({ params }: PageProps) {
  const { id } = await params;
  const paperId = parseInt(id, 10);
  if (isNaN(paperId)) notFound();

  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Link href={`/papers/${paper.id}`} className="text-[10px] font-black uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100">
        &larr; Back to Paper
      </Link>

      <div className="mt-6 border-t-8 border-brand bg-bg">
        <div className="border-b border-border p-6 md:p-8">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
            논문 수정
          </h1>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-brand">
            Edit Paper
          </p>
        </div>
        <div className="p-6 md:p-8">
          <PaperForm mode="edit" initialData={paper} />
        </div>
      </div>
    </div>
  );
}
