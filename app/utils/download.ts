/** Saves text as a file in the browser (client only). */
export const downloadFile = (name: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  URL.revokeObjectURL(url);
};

/** Rows to CSV text: quoted cells, CRLF lines, UTF-8 BOM so Excel reads accents. */
export const toCsv = (rows: (string | number)[][]) =>
  "﻿" +
  rows
    .map((line) => line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
