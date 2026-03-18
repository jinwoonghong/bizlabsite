import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-brand bg-bg p-4 md:px-8 md:py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand text-lg font-bold text-white md:h-14 md:w-14 md:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
            B
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight md:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              Business Archive
            </h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand md:text-[11px]">
              BizLab Research Papers
            </p>
          </div>
        </Link>
        <Link
          href="/papers/new"
          className="flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-colors hover:bg-brand-hover md:px-6 md:py-3 md:text-xs"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          논문 등록
        </Link>
      </div>
    </header>
  );
}
