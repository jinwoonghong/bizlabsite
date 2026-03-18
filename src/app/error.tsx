"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
        Something went wrong
      </h2>
      <p className="mt-2 text-xs opacity-40">
        페이지를 불러오는 중 오류가 발생했습니다.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-sm bg-brand px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-brand-hover"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-sm border-2 border-text/20 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:border-text hover:bg-text hover:text-white"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
