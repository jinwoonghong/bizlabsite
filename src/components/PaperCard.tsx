import Link from "next/link";
import type { Paper } from "@/types/paper";

interface PaperCardProps {
  paper: Paper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  return (
    <Link href={`/papers/${paper.id}`} className="block group">
      <div className="rounded-2xl bg-white p-5 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] active:scale-[0.98]">
        <h2 className="line-clamp-2 text-[16px] font-semibold text-toss-text-primary leading-snug group-hover:text-toss-blue transition-colors">
          {paper.title}
        </h2>
        <p className="mt-2 text-[14px] text-toss-text-secondary">{paper.authors}</p>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] text-toss-text-tertiary">
          <span>{paper.year}</span>
          {paper.journal && (
            <>
              <span>·</span>
              <span className="line-clamp-1">{paper.journal}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
