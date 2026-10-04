"use client";

import { useState } from "react";
import type { SearchExport } from "@/lib/export";
import type { SearchQuery } from "@/lib/google-search";
import { ExportButtons } from "./ExportButtons";
import { SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "done" } & SearchExport);

export function GoogleSearch() {
  const [state, setState] = useState<SearchState>({ status: "idle" });

  async function search(query: SearchQuery) {
    setState({ status: "loading" });
    const params = new URLSearchParams({
      q: query.keyword,
      country: query.country,
      language: query.language,
    });

    try {
      const response = await fetch(`/api/search?${params}`);
      const body = await response.json();
      if (!response.ok) {
        setState({ status: "error", message: body.error });
        return;
      }
      setState({ status: "done", query, results: body.results, searchedAt: body.searchedAt });
    } catch {
      setState({ status: "error", message: "Nepodařilo se spojit se serverem." });
    }
  }

  return (
    <>
      <SearchForm loading={state.status === "loading"} onSearch={search} />

      {state.status === "error" && (
        <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      {state.status === "done" && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <h2 className="text-lg font-medium">Výsledky pro „{state.query.keyword}“</h2>
            {state.results.length > 0 && <ExportButtons data={state} />}
          </div>
          <SearchResults results={state.results} />
        </section>
      )}
    </>
  );
}
