import { exportFileName, toCsv, toJson, type SearchExport } from "@/lib/export";

const buttonClassName =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100";

export function ExportButtons({ data }: { data: SearchExport }) {
  function download(content: string, type: string, extension: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName(data)}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => download(toJson(data), "application/json", "json")}
        className={buttonClassName}
      >
        Stáhnout JSON
      </button>
      <button
        type="button"
        // Excel on Windows guesses the encoding unless the file starts with a BOM.
        onClick={() => download(`\uFEFF${toCsv(data.results)}`, "text/csv;charset=utf-8", "csv")}
        className={buttonClassName}
      >
        Stáhnout CSV
      </button>
    </div>
  );
}
