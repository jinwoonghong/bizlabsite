"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

interface SearchBarProps {
  availableYears: number[];
}

export default function SearchBar({ availableYears }: SearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentYear = searchParams.get("year") || "";
  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";
  const sortValue = `${currentSortBy}-${currentOrder}`;

  const hasActiveFilters =
    query !== "" || currentYear !== "" || sortValue !== "createdAt-desc";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ query: value }), 300);
  };

  const handleClearAll = () => {
    setQuery("");
    router.push(pathname);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("query") || "");
  }, [searchParams]);

  return (
    <div className="mb-8 md:mb-12">
      {/* Search Input */}
      <div className="group relative">
        <svg
          className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 opacity-20 transition-opacity group-focus-within:opacity-60 md:left-2 md:h-6 md:w-6"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search papers..."
          className="w-full border-b-2 border-text/10 bg-transparent py-4 pl-8 pr-4 text-xl italic transition-colors placeholder:opacity-20 focus:border-brand focus:outline-none md:py-6 md:pl-12 md:text-2xl"
          style={{ fontFamily: "var(--font-serif)" }}
        />
      </div>

      {/* Filter Toggle + Filters */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-sm border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            showFilters
              ? "border-text bg-text text-white"
              : "border-text/20 hover:border-text hover:bg-text hover:text-white"
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline"
          >
            Reset All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
              Year
            </label>
            <select
              value={currentYear}
              onChange={(e) => updateParams({ year: e.target.value })}
              className="w-full border-b border-text/10 bg-transparent py-2 text-sm focus:border-brand focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest opacity-40">
              Sort By
            </label>
            <select
              value={sortValue}
              onChange={(e) => {
                const [s, o] = e.target.value.split("-");
                updateParams({ sortBy: s, order: o });
              }}
              className="w-full border-b border-text/10 bg-transparent py-2 text-sm focus:border-brand focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <option value="createdAt-desc">Latest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="year-desc">Year (Newest)</option>
              <option value="year-asc">Year (Oldest)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
