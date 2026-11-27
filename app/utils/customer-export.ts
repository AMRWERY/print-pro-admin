import type { CustomerDetail } from "~/types/admin/customers";

// Printable client dossier as a PDF. The libraries load on demand. Client only.

const egp = (n: number) =>
  `EGP ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const downloadCustomerPdf = async (c: CustomerDetail) => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const accent: [number, number, number] = [196, 36, 18];
  const after = () => (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120;

  doc.setFont("helvetica", "bold").setFontSize(20).text(c.name, margin, 56);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(110);
  doc.text(`${c.role}  |  ${c.org}`, margin, 74);
  doc.text(tr("common_ui.cexp_meta", { id: c.id, tier: c.tier, status: c.status }), margin, 90);

  autoTable(doc, {
    startY: 110,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [[tr("layout_ui.account"), ""]],
    body: [
      [tr("customers_ui.ltv_label"), egp(c.ltv)],
      [tr("common_ui.cexp_completed_orders"), String(c.orders)],
      [tr("common_ui.cexp_active_orders"), String(c.activeOrders)],
      [tr("customers_ui.on_time_payment_rating"), `${c.paymentRating}%`],
      [tr("auth_ui.email_label"), c.email],
      [tr("customers_ui.direct_line"), c.phone || "-"],
      [tr("customers_ui.export_col_region"), c.node],
      [tr("orders_ui.shipment_destination"), c.deliveryAddress || "-"],
      [tr("common_ui.cexp_tax_id"), c.taxId || "-"],
      [tr("customers_ui.payment_terms"), c.paymentTerms],
    ],
    headStyles: { fillColor: accent },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 140 } },
  });

  autoTable(doc, {
    startY: after() + 20,
    margin: { left: margin, right: margin },
    head: [[tr("dashboard_ui.recent_orders"), tr("orders_ui.export_col_placed"), tr("common_ui.status"), tr("settings_ui.export_col_value")]],
    body: c.recentOrders.length
      ? c.recentOrders.map((o) => [`${o.id}  ${o.title}`, o.placedAt.slice(0, 10), o.stageLabel, egp(o.amount)])
      : [[tr("customers_ui.no_orders_yet"), "", "", ""]],
    headStyles: { fillColor: accent },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 3: { halign: "right" } },
  });

  if (c.notes.length) {
    autoTable(doc, {
      startY: after() + 20,
      margin: { left: margin, right: margin },
      head: [[tr("common_ui.cexp_admin_notes"), tr("common_ui.cexp_when_utc")]],
      body: c.notes.map((n) => [`${n.urgent ? `[${tr("orders_ui.urgent").toUpperCase()}] ` : ""}${n.text}\n${n.author}`, n.at.slice(0, 16).replace("T", " ")]),
      headStyles: { fillColor: accent },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 1: { cellWidth: 100 } },
    });
  }

  doc.setFontSize(8).setTextColor(130);
  doc.text(tr("common_ui.cexp_footer"), margin, doc.internal.pageSize.getHeight() - 30);
  doc.save(`customer-${c.id}.pdf`);
};
