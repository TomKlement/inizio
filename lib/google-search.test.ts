import { describe, expect, it, vi } from "vitest";
import serperResponse from "./fixtures/serper-response.json";
import { searchGoogle, toSearchResults } from "./google-search";

const query = { keyword: "tvorba webových stránek", country: "cz", language: "cs" };

describe("toSearchResults", () => {
  it("returns only organic results in their original order", () => {
    expect(toSearchResults(serperResponse)).toEqual([
      {
        position: 1,
        title: "Tvorba webových stránek na míru | Inizio",
        url: "https://www.inizio.cz/tvorba-webovych-stranek/",
        snippet: "Navrhneme a naprogramujeme web, který prodává. Postaráme se o UX, SEO i obsah.",
      },
      {
        position: 2,
        title: "Jak vytvořit webové stránky zdarma – návod krok za krokem",
        url: "https://www.example.cz/navod/jak-vytvorit-web",
        snippet: 'Projdeme výběr domény, hostingu a redakčního systému, "bez programování".',
      },
      {
        position: 3,
        title: "Webnode: Vytvořte si web zdarma",
        url: "https://www.webnode.cz/",
        snippet: "",
      },
    ]);
  });

  it("returns an empty list when Google has no organic results", () => {
    expect(toSearchResults({})).toEqual([]);
  });
});

describe("searchGoogle", () => {
  it("asks Serper for the keyword in the chosen country and language", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(serperResponse));
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchGoogle(query, "secret-key");

    expect(results).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledWith("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": "secret-key", "Content-Type": "application/json" },
      body: JSON.stringify({ q: "tvorba webových stránek", gl: "cz", hl: "cs" }),
    });
  });

  it("fails when Serper rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Not enough credits", { status: 400 })),
    );

    await expect(searchGoogle(query, "secret-key")).rejects.toThrow(
      "Serper responded with 400: Not enough credits",
    );
  });
});
