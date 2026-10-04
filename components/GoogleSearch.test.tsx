import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GoogleSearch } from "./GoogleSearch";

const results = [
  {
    position: 1,
    title: "Tvorba webu | Inizio",
    url: "https://www.inizio.cz/",
    snippet: "Weby, e-shopy, SEO",
  },
  {
    position: 2,
    title: "Webnode",
    url: "https://www.webnode.cz/",
    snippet: "",
  },
];
const searchedAt = "2026-10-02T09:30:00.000Z";

function mockApi(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function searchFor(keyword: string) {
  const user = userEvent.setup();
  render(<GoogleSearch />);
  await user.type(screen.getByRole("searchbox", { name: "Hledaný výraz" }), keyword);
  await user.click(screen.getByRole("button", { name: "Hledat" }));
  return user;
}

describe("GoogleSearch", () => {
  it("shows organic results for the keyword", async () => {
    const fetchMock = mockApi({ results, searchedAt });

    await searchFor("tvorba webu");

    expect(await screen.findByRole("heading", { name: "Výsledky pro „tvorba webu“" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Tvorba webu | Inizio" })).toHaveAttribute(
      "href",
      "https://www.inizio.cz/",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith("/api/search?q=tvorba+webu&country=cz&language=cs");
  });

  it("sends the selected country and language", async () => {
    const fetchMock = mockApi({ results, searchedAt });
    const user = userEvent.setup();
    render(<GoogleSearch />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Země" }), "de");
    await user.selectOptions(screen.getByRole("combobox", { name: "Jazyk" }), "de");
    await user.type(screen.getByRole("searchbox"), "webdesign");
    await user.click(screen.getByRole("button", { name: "Hledat" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/search?q=webdesign&country=de&language=de");
  });

  it("shows the error returned by the API", async () => {
    mockApi({ error: "Vyhledávání se nepodařilo. Zkuste to prosím znovu." }, 502);

    await searchFor("inizio");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Vyhledávání se nepodařilo. Zkuste to prosím znovu.",
    );
  });

  it("shows an error when the server is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await searchFor("inizio");

    expect(await screen.findByRole("alert")).toHaveTextContent("Nepodařilo se spojit se serverem.");
  });

  it("explains an empty result and hides the export", async () => {
    mockApi({ results: [], searchedAt });

    await searchFor("asdfghjkl");

    expect(
      await screen.findByText("Google pro tento dotaz nevrátil žádné organické výsledky."),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Stáhnout JSON" })).not.toBeInTheDocument();
  });

  it("downloads the results as JSON and CSV", async () => {
    mockApi({ results, searchedAt });
    const createObjectURL = vi.fn<(blob: Blob) => string>().mockReturnValue("blob:results");
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = createObjectURL;
        static revokeObjectURL = vi.fn();
      },
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const user = await searchFor("tvorba webu");
    await user.click(await screen.findByRole("button", { name: "Stáhnout JSON" }));
    await user.click(screen.getByRole("button", { name: "Stáhnout CSV" }));

    const [json, csv] = createObjectURL.mock.calls.map(([blob]) => blob);
    expect(json.type).toBe("application/json");
    expect(JSON.parse(await json.text())).toMatchObject({ keyword: "tvorba webu", searchedAt, results });
    expect(csv.type).toBe("text/csv;charset=utf-8");
    expect(await csv.text()).toContain("position,title,url,snippet");
    expect(click).toHaveBeenCalledTimes(2);
  });
});
