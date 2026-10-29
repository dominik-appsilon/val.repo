// Shared helpers for the POC pages: data loading, value formatting, links.
import { parsePackages } from "./dcf.js";

// `?source=` picks the PACKAGES file. `fixture` is val.meter format (the
// target data model); `edge` is a hand-written file with NAs, missing and
// unparseable metrics; `prod` is today's riskmetric-scored file, for scale.
export const SOURCES = {
  fixture: "data/PACKAGES",
  edge: "data/PACKAGES.edge",
  prod: "https://raw.githubusercontent.com/pharmaR/val.repo/refs/heads/main/src/contrib/PACKAGES",
};

export function sourceName(search = window.location.search) {
  const s = new URLSearchParams(search).get("source");
  return s in SOURCES ? s : "fixture";
}

export async function loadPackages(source) {
  const res = await fetch(SOURCES[source]);
  if (!res.ok) throw new Error(`Failed to fetch ${SOURCES[source]}: ${res.status}`);
  return parsePackages(await res.text());
}

export function withSource(href, source) {
  if (source === "fixture") return href;
  return href + (href.includes("?") ? "&" : "?") + "source=" + source;
}

export function packageHref(name, source) {
  return withSource("package.html?pkg=" + encodeURIComponent(name), source);
}

// Display formatting only; stored metric values keep full precision.
export function formatValue(v) {
  if (v === undefined) return "";
  if (v === null) return "NA";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") {
    return Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: 3 }) : String(v);
  }
  if (typeof v === "object" && "r" in v) return v.r;
  return String(v);
}
