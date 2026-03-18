export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-white p-8 md:mt-32 md:p-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand text-xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
            B
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest">
            Business Archive
          </span>
        </div>
        <div className="md:text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
            BizLab Research Papers
          </p>
          <p className="mt-1 text-[10px] italic opacity-30">
            &copy; 2026 BizLab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
