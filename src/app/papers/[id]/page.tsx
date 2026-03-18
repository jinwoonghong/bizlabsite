import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import PaperActions from "@/components/PaperActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaperDetailPage({ params }: PageProps) {
  const { id } = await params;
  const paperId = parseInt(id, 10);
  if (isNaN(paperId)) notFound();

  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Link
        href="/"
        className="text-[10px] font-black uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100"
      >
        &larr; Back to List
      </Link>

      <article className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
          {paper.title}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-xs uppercase tracking-wider opacity-50">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {paper.authors}
        </p>

        <div className="mt-8 space-y-6">
          {/* Metadata Card */}
          <div className="border border-border bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Year</label>
                <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>{paper.year}</p>
              </div>
              {paper.journal && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Journal</label>
                  <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-mono)" }}>{paper.journal}</p>
                </div>
              )}
            </div>

            {paper.link && (
              <div className="mt-6">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Link</label>
                <div className="mt-2">
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-brand-hover"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Paper
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Abstract */}
          {paper.abstract && (
            <div className="border border-border bg-white p-6 md:p-8">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Abstract</label>
              <p className="mt-3 text-sm leading-relaxed opacity-70">
                {paper.abstract}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-6 text-[10px] uppercase tracking-widest opacity-30" style={{ fontFamily: "var(--font-mono)" }}>
            <span>Added {formatDate(paper.createdAt)}</span>
            <span>Updated {formatDate(paper.updatedAt)}</span>
          </div>
        </div>

        <PaperActions paperId={paper.id} />
      </article>
    </div>
  );
}
