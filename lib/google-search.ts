export type SearchQuery = {
  keyword: string;
  country: string;
  language: string;
};

export type SearchResult = {
  position: number;
  title: string;
  url: string;
  snippet: string;
};

type SerperResponse = {
  organic?: {
    position: number;
    title: string;
    link: string;
    snippet?: string;
  }[];
};

export function toSearchResults(response: SerperResponse): SearchResult[] {
  return (response.organic ?? []).map((item) => ({
    position: item.position,
    title: item.title,
    url: item.link,
    snippet: item.snippet ?? "",
  }));
}

export async function searchGoogle(
  { keyword, country, language }: SearchQuery,
  apiKey: string,
) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q: keyword, gl: country, hl: language }),
  });

  if (!response.ok) {
    throw new Error(`Serper responded with ${response.status}: ${await response.text()}`);
  }

  return toSearchResults(await response.json());
}
