import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import type { Paper } from "@/types/paper";

interface HomeProps {
  searchParams: Promise<{
    query?: string;
    year?: string;
    sortBy?: string;
    order?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params.query || "";
  const year = params.year || "";
  const sortBy = params.sortBy || "createdAt";
  const order = params.order || "desc";

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { authors: { contains: query } },
      { journal: { contains: query } },
    ];
  }
  if (year) {
    const parsedYear = parseInt(year, 10);
    if (!isNaN(parsedYear)) where.year = parsedYear;
  }

  const validSortFields = ["createdAt", "year", "title"];
  const validOrders = ["asc", "desc"];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeOrder = validOrders.includes(order) ? order : "desc";

  const [papers, yearResults] = await Promise.all([
    prisma.paper.findMany({ where, orderBy: { [safeSortBy]: safeOrder } }) as Promise<Paper[]>,
    prisma.paper.findMany({ select: { year: true }, distinct: ["year"], orderBy: { year: "desc" } }),
  ]);

  const availableYears = yearResults.map((r) => r.year);
  const hasActiveFilters = query !== "" || year !== "" || safeSortBy !== "createdAt" || safeOrder !== "desc";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <Suspense fallback={null}>
        <SearchBar availableYears={availableYears} />
      </Suspense>

      {papers.length === 0 ? (
        <div className="border border-border bg-white py-20 text-center">
          {hasActiveFilters ? (
            <>
              <p className="text-sm opacity-40">No results found.</p>
              <Link href="/" className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-brand hover:underline">
                Reset Filters
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm opacity-40">No papers registered yet.</p>
              <Link href="/papers/new" className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-brand hover:underline">
                Add Your First Paper
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden border border-border bg-white shadow-sm">
          {/* Table Header - Desktop Only */}
          <div className="hidden border-b border-border bg-text/5 px-6 py-3 md:grid md:grid-cols-[60px_2fr_1fr_80px_120px]">
            {["#", "Title & Authors", "Journal", "Year", "Actions"].map((h) => (
              <span key={h} className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">
                {h}
              </span>
            ))}
          </div>

          {/* Paper Rows */}
          {papers.map((paper, index) => (
            <div
              key={paper.id}
              className="group border-b border-border transition-colors last:border-b-0 hover:bg-brand/5"
            >
              {/* Desktop Layout */}
              <div className="hidden md:grid md:grid-cols-[60px_2fr_1fr_80px_120px] md:items-center md:p-6">
                {/* Index */}
                <span className="text-xs opacity-30" style={{ fontFamily: "var(--font-mono)" }}>
                  #{String(index + 1).padStart(3, "0")}
                </span>

                {/* Title & Authors */}
                <div className="pr-4">
                  <Link href={`/papers/${paper.id}`} className="block">
                    <h3 className="text-lg leading-tight transition-colors group-hover:text-brand" style={{ fontFamily: "var(--font-serif)" }}>
                      {paper.title}
                    </h3>
                  </Link>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-50">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {paper.authors}
                  </p>
                </div>

                {/* Journal */}
                <div className="flex items-center gap-1.5 text-xs opacity-70" style={{ fontFamily: "var(--font-mono)" }}>
                  {paper.journal && (
                    <>
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="line-clamp-1">{paper.journal}</span>
                    </>
                  )}
                </div>

                {/* Year */}
                <span className="text-xs opacity-70" style={{ fontFamily: "var(--font-mono)" }}>
                  {paper.year}
                </span>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  {paper.link && (
                    <a
                      href={paper.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm border border-border bg-white p-2.5 shadow-sm transition-all hover:border-brand hover:bg-brand hover:text-white"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <Link
                    href={`/papers/${paper.id}`}
                    className="rounded-sm border border-border bg-white p-2.5 shadow-sm transition-all hover:border-text hover:bg-text hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Mobile Layout */}
              <Link href={`/papers/${paper.id}`} className="block p-5 md:hidden">
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-[10px] opacity-30" style={{ fontFamily: "var(--font-mono)" }}>
                    #{String(index + 1).padStart(3, "0")}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-bold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                      {paper.title}
                    </h3>
                    <p className="mt-1 text-[10px] uppercase tracking-wider opacity-50">
                      {paper.authors}
                    </p>
                    <div className="mt-2 flex gap-3 text-[10px] opacity-50" style={{ fontFamily: "var(--font-mono)" }}>
                      {paper.journal && <span>{paper.journal}</span>}
                      <span>{paper.year}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-30">
        {hasActiveFilters ? `${papers.length} Results` : `${papers.length} Papers`}
      </p>
    </div>
  );
}
