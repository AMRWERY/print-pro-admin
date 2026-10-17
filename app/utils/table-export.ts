// Download a list of rows as a PDF or an Excel file. The libraries load on demand, so they
// only cost anything when someone exports. Client only.

export interface TableExport {
  title: string;
  subtitle?: string;
  /** File name without extension. */
  fileName: string;
  head: string[];
  body: (string | number)[][];
  /** Column indexes holding money in EGP: formatted in the PDF, kept as numbers in Excel. */
  moneyCols?: number[];
  /** Column indexes holding other numbers (right-aligned in the PDF). */
  numberCols?: number[];
}

const egp = (n: number) =>
  `EGP ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const downloadTablePdf = async (t: TableExport) => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const money = new Set(t.moneyCols);
  const right = new Set([...(t.moneyCols ?? []), ...(t.numberCols ?? [])]);

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const margin = 36;

  doc.setFont("helvetica", "bold").setFontSize(16).text(t.title, margin, 42);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(110);
  doc.text(
    [t.subtitle, `Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`]
      .filter(Boolean)
      .join("  |  "),
    margin,
    58,
  );

  autoTable(doc, {
    startY: 72,
    margin: { left: margin, right: margin, bottom: 36 },
    head: [t.head],
    body: t.body.map((row) =>
      row.map((cell, i) => (money.has(i) && typeof cell === "number" ? egp(cell) : String(cell))),
    ),
    headStyles: { fillColor: [196, 36, 18] },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    columnStyles: Object.fromEntries([...right].map((i) => [i, { halign: "right" as const }])),
    didDrawPage: () => {
      doc.setFontSize(8).setTextColor(130);
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        doc.internal.pageSize.getWidth() - margin,
        doc.internal.pageSize.getHeight() - 18,
        { align: "right" },
      );
    },
  });

  doc.save(`${t.fileName}.pdf`);
};

export const downloadTableExcel = async (t: TableExport) => {
  const XLSX = await import("xlsx");

  const sheet = XLSX.utils.aoa_to_sheet([t.head, ...t.body]);
  // Widths follow the longest cell in each column (capped so notes don't stretch the sheet).
  sheet["!cols"] = t.head.map((h, i) => ({
    wch: Math.min(60, Math.max(h.length, ...t.body.map((r) => String(r[i] ?? "").length)) + 2),
  }));

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, t.title.slice(0, 31).replace(/[\\/?*[\]:]/g, " "));
  XLSX.writeFile(book, `${t.fileName}.xlsx`);
};

export const downloadTable = (format: "pdf" | "excel", t: TableExport) =>
  format === "pdf" ? downloadTablePdf(t) : downloadTableExcel(t);
