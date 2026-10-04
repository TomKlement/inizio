import type { SearchQuery, SearchResult } from "./google-search";

export type SearchExport = {
  query: SearchQuery;
  searchedAt: string;
  results: SearchResult[];
};

const csvColumns = ["position", "title", "url", "snippet"] as const;

export function toJson({ query, searchedAt, results }: SearchExport) {
  return JSON.stringify({ ...query, searchedAt, results }, null, 2);
}

export function toCsv(results: SearchResult[]) {
  const rows = results.map((result) =>
    csvColumns.map((column) => escapeCsvValue(String(result[column]))).join(","),
  );
  return [csvColumns.join(","), ...rows].join("\r\n");
}

function escapeCsvValue(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function exportFileName({ query, searchedAt }: SearchExport) {
  const slug = query.keyword
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `google-${slug}-${query.country}-${searchedAt.slice(0, 10)}`;
}
