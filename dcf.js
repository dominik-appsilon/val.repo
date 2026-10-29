// Minimal client-side parser for R repository PACKAGES files (DCF).
// Mirrors read.dcf(): records are separated by blank lines, continuation
// lines start with whitespace and are joined with "\n" (a lone "." is an
// empty line), values are trimmed, and a repeated key keeps the last value.

export function parseDCF(text) {
  const records = [];
  let rec = null;
  let key = null;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*$/.test(line)) {
      rec = null;
      key = null;
    } else if (/^\s/.test(line)) {
      if (key === null) continue;
      const cont = line.trim();
      rec[key] += "\n" + (cont === "." ? "" : cont);
    } else {
      const i = line.indexOf(":");
      if (i < 0) continue;
      if (rec === null) records.push((rec = {}));
      key = line.slice(0, i);
      rec[key] = line.slice(i + 1).trim();
    }
  }
  return records;
}

// Parse a deparsed scalar R value as written by val.meter (`Metric/x@R`).
// Anything that isn't a simple literal is returned as { r: "<source>" }.
export function parseRLiteral(s) {
  s = s.trim();
  if (s === "TRUE") return true;
  if (s === "FALSE") return false;
  if (/^NA(_integer_|_real_|_character_)?$/.test(s) || s === "NULL") return null;
  if (s === "Inf") return Infinity;
  if (s === "-Inf") return -Infinity;
  if (s === "NaN") return NaN;
  if (/^-?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?L?$/.test(s)) return Number(s.replace(/L$/, ""));
  if (/^"([^"\\]|\\.)*"$/.test(s)) {
    try {
      return JSON.parse(s);
    } catch {}
  }
  return { r: s };
}

const METRIC_FIELD = /^Metric\/(.+)@R$/;

// Parse a PACKAGES file into package records. Stanzas without a `Package`
// field (e.g. val.meter's leading `Format: Metrics`) are dropped. val.meter
// metric fields are moved into `metrics`, keyed by metric name.
export function parsePackages(text) {
  return parseDCF(text)
    .filter((rec) => "Package" in rec)
    .map((rec) => {
      const fields = {};
      const metrics = {};
      for (const [k, v] of Object.entries(rec)) {
        const m = k.match(METRIC_FIELD);
        if (m) metrics[m[1]] = parseRLiteral(v);
        else fields[k] = v;
      }
      return { ...fields, metrics };
    });
}
