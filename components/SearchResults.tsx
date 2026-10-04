import type { SearchResult } from "@/lib/google-search";

export function SearchResults({ results }: { results: SearchResult[] }) {
  if (results.length === 0) {
    return (
      <p className="mt-6 text-zinc-600">Google pro tento dotaz nevrátil žádné organické výsledky.</p>
    );
  }

  return (
    <ol className="mt-6 flex flex-col gap-6">
      {results.map((result) => (
        <li key={result.position} className="flex gap-4">
          <span className="w-6 shrink-0 pt-0.5 text-right text-sm tabular-nums text-zinc-400">
            {result.position}.
          </span>
          <div className="min-w-0">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-blue-700 hover:underline"
            >
              {result.title}
            </a>
            <p className="break-all text-sm text-green-800">{result.url}</p>
            {result.snippet && <p className="mt-1 text-sm text-zinc-700">{result.snippet}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
