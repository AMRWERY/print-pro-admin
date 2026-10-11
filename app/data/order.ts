import { countries } from "~/data/checkout";
import type { Order } from "~/types/order";

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export const addWorkingDays = (from: Date, days: number) => {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) left--;
  }
  return d;
};

const at = (d: Date, hour: number) => {
  const x = new Date(d);
  x.setHours(hour, 0, 0, 0);
  return x;
};

export const formatWhen = (d: Date, withTime = true) =>
  d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  });

export const countryName = (code: string) => countries.find((c) => c.code === code)?.name ?? code;

export type StepStatus = "done" | "current" | "queued";

export interface TimelineStep {
  key: string;
  title: string;
  body: string;
  status: StepStatus;
  /** Shown as the time for the step; null means "in progress". */
  when: Date | null;
}

/** The sequence an order goes through. Steps are estimates until there is a real backend. */
export const orderTimeline = (o: Order): TimelineStep[] => {
  const created = new Date(o.createdAt);
  const pickup = o.delivery.id === "pickup";

  return [
    {
      key: "auth",
      title: "Order authorized",
      body:
        o.payment.id === "wire"
          ? "Your reservation is confirmed. Funds are due within 5 business days."
          : "Payment received and the order is registered with the bench.",
      status: "done",
      when: created,
    },
    {
      key: "qa",
      title: "Bench QA & calibration",
      body: "A technician checks every item against its spec sheet and prepares the calibration report.",
      status: "current",
      when: null,
    },
    {
      key: "pack",
      title: "Protective packaging",
      body: "Items are sealed in climate-damped crating with shock and humidity loggers.",
      status: "queued",
      when: at(addWorkingDays(created, 1), 9),
    },
    {
      key: "ship",
      title: pickup ? "Ready for pickup" : o.delivery.label,
      body: pickup
        ? "Collect your order from our NYC bench with photo ID and your order number."
        : o.delivery.note,
      status: "queued",
      when: at(addWorkingDays(created, o.delivery.days), pickup ? 10 : 17),
    },
  ];
};

/** When the order leaves the bench (or is ready to collect). */
export const estimatedHandover = (o: Order) => orderTimeline(o).at(-1)!.when!;

export const orderSupport = {
  phone: "+1 (800) 492-5866",
  phoneHref: "tel:+18004925866",
  email: "dispatch@printpro.com",
};
