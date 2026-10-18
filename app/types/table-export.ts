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
