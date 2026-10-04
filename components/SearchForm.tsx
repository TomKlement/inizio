import type { FormEvent } from "react";
import type { SearchQuery } from "@/lib/google-search";
import { countries, defaultCountry, defaultLanguage, languages } from "@/lib/locales";

type Props = {
  loading: boolean;
  onSearch: (query: SearchQuery) => void;
};

export function SearchForm({ loading, onSearch }: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSearch({
      keyword: String(form.get("keyword")).trim(),
      country: String(form.get("country")),
      language: String(form.get("language")),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="keyword"
          type="search"
          required
          autoFocus
          aria-label="Hledaný výraz"
          placeholder="Zadejte klíčové slovo"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Hledám…" : "Hledat"}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <label htmlFor="country">Země</label>
          <select
            id="country"
            name="country"
            defaultValue={defaultCountry}
            className="rounded-md border border-zinc-300 px-2 py-1"
          >
            {countries.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="language">Jazyk</label>
          <select
            id="language"
            name="language"
            defaultValue={defaultLanguage}
            className="rounded-md border border-zinc-300 px-2 py-1"
          >
            {languages.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
