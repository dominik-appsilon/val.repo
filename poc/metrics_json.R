# Export val.meter metric metadata to data/metrics.json for the POC site.
#
# Usage (from the val.repo root):
#   Rscript poc/metrics_json.R [path/to/val.meter]
#
# Without a path, the installed val.meter is used. Rd titles and descriptions
# are converted to HTML fragments so formatting like \code{} is kept (titles
# may also be plain character strings).

args <- commandArgs(trailingOnly = TRUE)
if (length(args)) pkgload::load_all(args[[1]], quiet = TRUE) else library(val.meter)

rd_to_html <- function(rd) {
  if (!inherits(rd, "Rd")) {
    txt <- paste(rd, collapse = " ")
    for (r in list(c("&", "&amp;"), c("<", "&lt;"), c(">", "&gt;"))) {
      txt <- gsub(r[[1]], r[[2]], txt, fixed = TRUE)
    }
    return(txt)
  }
  html <- capture.output(tools::Rd2HTML(rd, fragment = TRUE, out = stdout()))
  trimws(gsub("\\s+", " ", paste(html, collapse = " ")))
}

info <- metrics()
out <- lapply(names(info), function(name) {
  x <- info[[name]]
  list(
    name = name,
    title = rd_to_html(x@title),
    description = rd_to_html(x@description),
    tags = I(as.character(x@tags)),
    permissions = I(as.character(x@permissions))
  )
})

dir.create("poc/data", showWarnings = FALSE)
jsonlite::write_json(out, "poc/data/metrics.json", auto_unbox = TRUE, pretty = TRUE)
message("Wrote ", length(out), " metrics to poc/data/metrics.json")
