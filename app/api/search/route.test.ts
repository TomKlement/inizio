import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchGoogle } from "@/lib/google-search";
import { GET } from "./route";

vi.mock("@/lib/google-search", () => ({ searchGoogle: vi.fn() }));

function request(params: string) {
  return GET(new Request(`http://localhost/api/search?${params}`));
}

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.mocked(searchGoogle).mockReset();
    vi.stubEnv("SERPER_API_KEY", "secret-key");
  });

  it("returns organic results for the keyword", async () => {
    const results = [{ position: 1, title: "Inizio", url: "https://www.inizio.cz/", snippet: "" }];
    vi.mocked(searchGoogle).mockResolvedValue(results);

    const response = await request("q=%20inizio%20&country=sk&language=sk");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ results, searchedAt: expect.any(String) });
    expect(searchGoogle).toHaveBeenCalledWith(
      { keyword: "inizio", country: "sk", language: "sk" },
      "secret-key",
    );
  });

  it("searches in Czech on google.cz by default", async () => {
    vi.mocked(searchGoogle).mockResolvedValue([]);

    await request("q=inizio");

    expect(searchGoogle).toHaveBeenCalledWith(
      { keyword: "inizio", country: "cz", language: "cs" },
      "secret-key",
    );
  });

  it("rejects an empty keyword", async () => {
    const response = await request("q=%20%20");

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Zadejte hledaný výraz." });
    expect(searchGoogle).not.toHaveBeenCalled();
  });

  it("rejects an unsupported country", async () => {
    const response = await request("q=inizio&country=xx");

    expect(response.status).toBe(400);
    expect(searchGoogle).not.toHaveBeenCalled();
  });

  it("reports a missing API key", async () => {
    vi.stubEnv("SERPER_API_KEY", "");

    const response = await request("q=inizio");

    expect(response.status).toBe(500);
    expect(searchGoogle).not.toHaveBeenCalled();
  });

  it("returns 502 when Serper fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(searchGoogle).mockRejectedValue(new Error("Serper responded with 500"));

    const response = await request("q=inizio");

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Vyhledávání se nepodařilo. Zkuste to prosím znovu.",
    });
  });
});
