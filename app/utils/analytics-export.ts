import { cohortLabel, funnelLabel, pointLabel, regionLabel, velocityMeta } from "~/data/analytics-meta";
import type { AnalyticsResponse, TopProductRow } from "~/types/admin/analytics";

/** A category's name for the report, from the shared list (the raw key if it is gone). */
const categoryName = (key: string) => useCategoriesStore().label(key);

// The analytics report as a PDF or an Excel workbook. The libraries load on demand. Client only.

const egp = (n: number) =>
  `EGP ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

const fileStamp = (a: AnalyticsResponse) => `${a.period.from}_${a.period.to}`;

const subtitle = (a: AnalyticsResponse) =>
  tr(a.period.days > 1 ? "analytics_ui.exp_subtitle" : "analytics_ui.exp_subtitle_one_day", {
    from: a.period.from,
    to: a.period.to,
    days: a.period.days,
    cohort: cohortLabel[a.query.cohort],
  });

export const downloadAnalyticsPdf = async (a: AnalyticsResponse, top: TopProductRow[]) => {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const accent: [number, number, number] = [196, 36, 18];
  const after = () => (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
  const table = (head: string[], body: (string | number)[][], right: number[] = []) =>
    autoTable(doc, {
      startY: after() + 18,
      margin: { left: margin, right: margin },
      head: [head],
      body: body.map((r) => r.map(String)),
      headStyles: { fillColor: accent },
      styles: { fontSize: 8.5, cellPadding: 4 },
      columnStyles: Object.fromEntries(right.map((i) => [i, { halign: "right" as const }])),
    });

  doc.setFont("helvetica", "bold").setFontSize(18).text(tr("analytics_ui.exp_title"), margin, 52);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(110).text(subtitle(a), margin, 68);

  const k = a.kpis;
  autoTable(doc, {
    startY: 84,
    margin: { left: margin, right: margin },
    head: [[tr("analytics_ui.exp_col_indicator"), tr("settings_ui.export_col_value"), tr("analytics_ui.change")]],
    body: [
      [tr("analytics_ui.kpi_turnover"), egp(k.turnover), `${k.turnoverDelta >= 0 ? "+" : ""}${pct(k.turnoverDelta)} ${tr("analytics_ui.vs_previous_period")}`],
      [tr("analytics_ui.kpi_orders"), String(k.orders), `+${pct(k.ordersDelta)} (${tr("analytics_ui.in_progress_count", { count: k.inProgress })})`],
      [tr("analytics_ui.kpi_aov"), egp(k.aov), `+${pct(k.aovDelta)}`],
      [tr("analytics_ui.exp_storefront_conversion"), pct(k.conversion, 2), `+${pct(k.conversionDelta, 2)} (${tr("analytics_ui.sessions_count", { count: k.sessions })})`],
      [tr("analytics_ui.kpi_new_business"), `+${k.intake}`, `+${pct(k.intakeDelta)}`],
    ],
    headStyles: { fillColor: accent },
    styles: { fontSize: 9, cellPadding: 5 },
  });

  table(
    [tr("analytics_ui.exp_col_stage"), tr("analytics_ui.exp_col_count"), tr("analytics_ui.exp_col_of_sessions"), tr("analytics_ui.exp_col_drop_off")],
    a.funnel.stages.map((s) => [funnelLabel[s.key].title, s.count, pct(s.pct, 2), s.drop === null ? "-" : pct(s.drop)]),
    [1, 2, 3],
  );
  table(
    [tr("analytics_ui.division"), tr("analytics_ui.exp_col_revenue"), tr("analytics_ui.exp_col_share"), tr("analytics_ui.exp_col_yoy"), tr("analytics_ui.margin")],
    a.categories.map((c) => [categoryName(c.category), egp(c.revenue), pct(c.share), pct(c.yoy), pct(c.margin)]),
    [1, 2, 3, 4],
  );
  table(
    [tr("customers_ui.export_col_region"), tr("analytics_ui.kpi_orders"), tr("analytics_ui.exp_col_revenue"), tr("analytics_ui.exp_col_share")],
    a.regions.map((r) => [regionLabel[r.key].name, r.orders, egp(r.revenue), pct(r.share)]),
    [1, 2, 3],
  );
  table(
    [tr("dashboard_ui.best_selling_products"), tr("analytics_ui.col_units"), tr("analytics_ui.exp_col_revenue"), tr("analytics_ui.margin"), tr("analytics_ui.col_buffer"), tr("common_ui.status")],
    top.map((t) => [`${t.name} (${t.sku})`, t.units, egp(t.revenue), pct(t.margin), tr("analytics_ui.exp_days", { n: t.daysLeft }), velocityMeta[t.status].label]),
    [1, 2, 3, 4],
  );

  doc.setFontSize(8).setTextColor(130);
  doc.text(tr("common_ui.exp_generated_by"), margin, doc.internal.pageSize.getHeight() - 30);
  doc.save(`analytics-report-${fileStamp(a)}.pdf`);
};

export const downloadAnalyticsExcel = async (a: AnalyticsResponse, top: TopProductRow[]) => {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();
  const add = (name: string, rows: (string | number)[][], widths: number[]) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(book, sheet, name);
  };
  const k = a.kpis;

  add(
    tr("common_ui.summary"),
    [
      [tr("analytics_ui.exp_period"), `${a.period.from} to ${a.period.to}`],
      [tr("analytics_ui.series_previous_period"), `${a.period.prevFrom} to ${a.period.prevTo}`],
      [tr("analytics_ui.exp_cohort"), cohortLabel[a.query.cohort]],
      [],
      [tr("analytics_ui.kpi_turnover"), k.turnover],
      [tr("analytics_ui.exp_change_pct"), k.turnoverDelta],
      [tr("analytics_ui.kpi_orders"), k.orders],
      [tr("orders_ui.pipeline_state_active"), k.inProgress],
      [tr("analytics_ui.kpi_aov"), k.aov],
      [tr("analytics_ui.exp_conversion_pct"), k.conversion],
      [tr("analytics_ui.exp_sessions"), k.sessions],
      [tr("analytics_ui.kpi_new_business"), k.intake],
      [tr("analytics_ui.exp_portfolio_margin_pct"), a.portfolioMargin],
    ],
    [34, 30],
  );
  add(
    tr("analytics_ui.exp_col_revenue"),
    [[tr("analytics_ui.exp_interval"), tr("analytics_ui.exp_col_revenue"), tr("analytics_ui.series_previous_period"), tr("analytics_ui.cash_collected"), tr("analytics_ui.net_margin")], ...a.series.map((p) => [pointLabel(p.at, a.granularity), p.revenue, p.prior, p.collected, p.margin])],
    [16, 14, 16, 16, 14],
  );
  add(
    tr("analytics_ui.exp_sheet_funnel"),
    [[tr("orders_ui.export_col_stage"), tr("analytics_ui.exp_col_count"), tr("analytics_ui.exp_share_sessions_pct"), tr("analytics_ui.exp_drop_pct")], ...a.funnel.stages.map((s) => [funnelLabel[s.key].title, s.count, s.pct, s.drop ?? ""])],
    [34, 12, 22, 14],
  );
  add(
    tr("analytics_ui.exp_sheet_divisions"),
    [[tr("analytics_ui.division"), tr("analytics_ui.exp_col_revenue"), tr("analytics_ui.exp_share_pct"), tr("analytics_ui.exp_yoy_pct"), tr("analytics_ui.exp_margin_pct")], ...a.categories.map((c) => [categoryName(c.category), c.revenue, c.share, c.yoy, c.margin])],
    [30, 14, 12, 10, 12],
  );
  add(
    tr("analytics_ui.exp_sheet_regions"),
    [[tr("customers_ui.export_col_region"), tr("analytics_ui.kpi_orders"), tr("analytics_ui.exp_col_revenue"), tr("analytics_ui.exp_share_pct")], ...a.regions.map((r) => [regionLabel[r.key].name, r.orders, r.revenue, r.share])],
    [30, 14, 14, 12],
  );
  add(
    tr("analytics_ui.exp_sheet_best_sellers"),
    [[tr("analytics_ui.exp_rank"), tr("analytics_ui.col_sku"), tr("common_ui.name"), tr("analytics_ui.division"), tr("analytics_ui.col_units"), tr("analytics_ui.exp_col_revenue"), tr("analytics_ui.exp_margin_pct"), tr("analytics_ui.exp_days_buffer"), tr("common_ui.status")], ...top.map((t) => [t.rank, t.sku, t.name, categoryName(t.category), t.units, t.revenue, t.margin, t.daysLeft, velocityMeta[t.status].label])],
    [6, 18, 40, 24, 8, 14, 10, 14, 12],
  );

  XLSX.writeFile(book, `analytics-report-${fileStamp(a)}.xlsx`);
};
