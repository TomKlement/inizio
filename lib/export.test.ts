import { describe, expect, it } from "vitest";
import { exportFileName, toCsv, toJson, type SearchExport } from "./export";

const data: SearchExport = {
  query: { keyword: "Tvorba webových stránek", country: "cz", language: "cs" },
  searchedAt: "2026-10-02T09:30:00.000Z",
  results: [
    {
      position: 1,
      title: "Tvorba webu | Inizio",
      url: "https://www.inizio.cz/",
      snippet: "Weby, e-shopy, SEO",
    },
    {
      position: 2,
      title: 'Návod "krok za krokem"',
      url: "https://www.example.cz/navod",
      snippet: "První řádek\nDruhý řádek",
    },
  ],
};

describe("toJson", () => {
  it("includes the search parameters next to the results", () => {
    expect(JSON.parse(toJson(data))).toEqual({
      keyword: "Tvorba webových stránek",
      country: "cz",
      language: "cs",
      searchedAt: "2026-10-02T09:30:00.000Z",
      results: data.results,
    });
  });
});

describe("toCsv", () => {
  it("writes a header and one row per result", () => {
    const lines = toCsv(data.results).split("\r\n");

    expect(lines[0]).toBe("position,title,url,snippet");
    expect(lines[1]).toBe('1,Tvorba webu | Inizio,https://www.inizio.cz/,"Weby, e-shopy, SEO"');
  });

  it("quotes values with quotes and line breaks", () => {
    expect(toCsv([data.results[1]])).toBe(
      'position,title,url,snippet\r\n2,"Návod ""krok za krokem""",https://www.example.cz/navod,"První řádek\nDruhý řádek"',
    );
  });

  it("writes only the header when there are no results", () => {
    expect(toCsv([])).toBe("position,title,url,snippet");
  });
});

describe("exportFileName", () => {
  it("builds a file name without diacritics and spaces", () => {
    expect(exportFileName(data)).toBe("google-tvorba-webovych-stranek-cz-2026-10-02");
  });
});
