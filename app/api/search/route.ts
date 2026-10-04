import { searchGoogle } from "@/lib/google-search";
import { countries, defaultCountry, defaultLanguage, languages } from "@/lib/locales";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const keyword = params.get("q")?.trim();
  const country = params.get("country") ?? defaultCountry;
  const language = params.get("language") ?? defaultLanguage;

  if (!keyword) {
    return Response.json({ error: "Zadejte hledaný výraz." }, { status: 400 });
  }

  if (
    !countries.some(({ code }) => code === country) ||
    !languages.some(({ code }) => code === language)
  ) {
    return Response.json({ error: "Nepodporovaná země nebo jazyk." }, { status: 400 });
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server nemá nastavený SERPER_API_KEY." }, { status: 500 });
  }

  try {
    const results = await searchGoogle({ keyword, country, language }, apiKey);
    // Cached for an hour so the same query doesn't use another Serper credit.
    return Response.json(
      { results, searchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=3600" } },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Vyhledávání se nepodařilo. Zkuste to prosím znovu." },
      { status: 502 },
    );
  }
}
