import type { OrderDetail } from "~/types/admin/orders";

// Invoice downloads for one order. The libraries are imported on demand so they
// only load when someone actually exports. Client only.

const money = (n: number) =>
  `EGP ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fileName = (d: OrderDetail, ext: string) =>
  `invoice-${d.row.id.slice(1).toLowerCase()}.${ext}`;

/** Invoice as a PDF: header, customer, line items and the price breakdown. */
export const downloadOrderPdf = async (d: OrderDetail) => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const accent: [number, number, number] = [196, 36, 18];

  doc
    .setFont("helvetica", "bold")
    .setFontSize(20)
    .text(tr("common_ui.oexp_title", { id: d.row.id }), margin, 56);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(110);
  doc.text(
    tr("common_ui.oexp_created", {
      date: d.row.placedAt.slice(0, 10),
      time: d.row.placedAt.slice(11, 19),
      hash: d.row.hex,
    }),
    margin,
    74,
  );

  doc
    .setTextColor(30)
    .setFontSize(11)
    .setFont("helvetica", "bold")
    .text(tr("orders_ui.customer_field"), margin, 104);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(
    [
      d.row.customer.name,
      d.row.customer.org,
      d.customer.email,
      d.customer.phone,
      tr("common_ui.oexp_tax_id", { id: d.customer.taxId }),
    ],
    margin,
    120,
  );

  const phase = d.phases.find((p) => p.stage === d.row.stage);
  doc.setFont("helvetica", "bold").setFontSize(11).text(tr("common_ui.status"), 340, 104);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(
    [
      tr("common_ui.oexp_stage", { stage: phase?.title ?? d.row.stage }),
      tr("common_ui.oexp_waybill", { value: d.shipment.waybill }),
      tr("common_ui.oexp_carrier", { value: d.shipment.carrier }),
    ],
    340,
    120,
  );

  autoTable(doc, {
    startY: 205,
    margin: { left: margin, right: margin },
    head: [[tr("analytics_ui.col_sku"), tr("common_ui.oexp_col_item"), tr("orders_ui.qty_label"), tr("orders_ui.unit_price"), tr("common_ui.oexp_col_total")]],
    body: d.lines.map((l) => [
      l.sku,
      `${l.title}\n${l.spec}`,
      tr(l.quantity > 1 ? "common_ui.oexp_qty_units" : "common_ui.oexp_qty_unit", { qty: l.quantity, unit: l.unit }),
      money(l.unitPrice),
      money(l.total),
    ]),
    headStyles: { fillColor: accent },
    styles: { fontSize: 9, cellPadding: 6, valign: "middle" },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  const p = d.pricing;
  const totals: [string, string][] = [
    [tr("common_ui.oexp_subtotal"), money(p.subtotal)],
    [tr("orders_ui.testing_setup_fee"), money(p.setupFee)],
    [tr("common_ui.oexp_courier"), money(p.courier)],
    ...(p.discount
      ? ([
          [
            tr("orders_ui.institutional_discount", { rate: Math.round(p.discountRate * 100) }),
            `-${money(p.discount)}`,
          ],
        ] as [string, string][])
      : []),
    [tr("common_ui.oexp_vat"), money(p.vat)],
    [tr("common_ui.oexp_total"), money(p.total)],
  ];

  const afterLines =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 400;
  autoTable(doc, {
    startY: afterLines + 16,
    margin: { left: 300, right: margin },
    body: totals,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 1: { halign: "right" } },
    didParseCell: (hook) => {
      if (hook.row.index === totals.length - 1) {
        hook.cell.styles.fontStyle = "bold";
        hook.cell.styles.fontSize = 11;
      }
    },
  });

  doc.setFontSize(8).setTextColor(130);
  doc.text(
    tr("common_ui.exp_generated_by"),
    margin,
    doc.internal.pageSize.getHeight() - 30,
  );

  doc.save(fileName(d, "pdf"));
};

/** Invoice as a workbook: summary, line items, internal notes and the ledger. */
export const downloadOrderExcel = async (d: OrderDetail) => {
  const XLSX = await import("xlsx");
  const p = d.pricing;

  const book = XLSX.utils.book_new();
  const add = (name: string, rows: (string | number)[][], widths: number[]) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(book, sheet, name);
  };

  add(
    tr("common_ui.summary"),
    [
      [tr("orders_ui.export_col_order"), d.row.id],
      [tr("common_ui.oexp_created_utc"), d.row.placedAt],
      [tr("common_ui.oexp_hash"), d.row.hex],
      [tr("orders_ui.customer_field"), d.row.customer.name],
      [tr("orders_ui.export_col_company"), d.row.customer.org],
      [tr("auth_ui.email_label"), d.customer.email],
      [tr("orders_ui.export_col_stage"), d.row.stage],
      [tr("orders_ui.shipment_waybill"), d.shipment.waybill],
      [],
      [tr("common_ui.oexp_subtotal_egp"), p.subtotal],
      [tr("common_ui.oexp_setup_fee_egp"), p.setupFee],
      [tr("common_ui.oexp_courier_egp"), p.courier],
      [tr("common_ui.oexp_discount_egp"), -p.discount],
      [tr("common_ui.oexp_vat_egp"), p.vat],
      [tr("common_ui.oexp_total_egp"), p.total],
    ],
    [30, 44],
  );

  add(
    tr("orders_ui.line_items"),
    [
      [
        tr("analytics_ui.col_sku"),
        tr("common_ui.oexp_col_item"),
        tr("common_ui.oexp_col_spec"),
        tr("orders_ui.qty_label"),
        tr("common_ui.oexp_col_unit"),
        tr("common_ui.oexp_col_unit_price_egp"),
        tr("common_ui.oexp_col_total_egp"),
      ],
      ...d.lines.map((l) => [
        l.sku,
        l.title,
        l.spec,
        l.quantity,
        l.unit,
        l.unitPrice,
        l.total,
      ]),
    ],
    [20, 44, 40, 6, 8, 16, 14],
  );

  add(
    tr("common_ui.notes"),
    [
      [tr("common_ui.oexp_col_author"), tr("common_ui.oexp_col_when"), tr("orders_ui.urgent"), tr("common_ui.oexp_col_note")],
      ...d.notes.map((n) => [n.author, n.ago, tr(n.urgent ? "common_ui.exp_yes" : "common_ui.exp_no"), n.text]),
    ],
    [28, 14, 8, 90],
  );

  add(
    tr("common_ui.oexp_sheet_ledger"),
    [[tr("common_ui.oexp_col_timestamp"), tr("common_ui.oexp_col_event")], ...d.ledger.map((e) => [e.at, e.text])],
    [26, 70],
  );

  XLSX.writeFile(book, fileName(d, "xlsx"));
};