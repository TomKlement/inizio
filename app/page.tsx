import { GoogleSearch } from "@/components/GoogleSearch";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Výsledky vyhledávání Google</h1>
      <p className="mt-2 text-zinc-600">
        Zadejte klíčové slovo a stáhněte si organické výsledky z první stránky jako JSON nebo CSV.
      </p>
      <GoogleSearch />
    </main>
  );
}
