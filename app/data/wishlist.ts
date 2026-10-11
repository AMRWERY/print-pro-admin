export const studioTags = [
  "Main studio A",
  "Bay 2 splash lab",
  "Printworks archival wing",
  "Street & doc kit",
  "Museum print runs",
  "Unassigned",
];

export const wishlistSortOptions = [
  { key: "price-desc", label: "Price (high to low)" },
  { key: "price-asc", label: "Price (low to high)" },
  { key: "rating", label: "Top rated" },
  { key: "name", label: "Name (A–Z)" },
] as const;

/** One-click sample so a new visitor can see a populated registry. */
export const sampleRegistry = ["x2d", "pro11", "p9570", "summilux", "hahnemuhle-308"];

export const wishlistAssurances = [
  { icon: "lucide:flask-conical", title: "Optical bench testing", body: "Every lens, generator and medium-format chassis is bench-tested and collimated before it leaves us." },
  { icon: "lucide:truck", title: "Bonded vault dispatch", body: "Temperature-controlled crated transport for high-precision engines and fragile sensor assemblies." },
  { icon: "lucide:shield-check", title: "ISO 9706 archival guarantee", body: "Substrates certified acid-free and calcium-carbonate buffered for 200+ year museum life." },
  { icon: "lucide:users", title: "Collaborative registry", body: "Share your manifest with studio managers, DITs and purchasing officers." },
];
