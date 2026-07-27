#!/usr/bin/env bash
# Regenerate PrepAlign sample intelligence PDF from HTML.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
HTML="$ROOT/weekly-intelligence-report.html"
TMP="$ROOT/_tmp-report.pdf"
OUT="$ROOT/../public/PrepAlign-Weekly-Career-Intelligence-Report.pdf"

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=12000 \
  --print-to-pdf="$TMP" \
  "file://$HTML"

python3 << PY
import fitz
from pathlib import Path

src = Path("$TMP")
dst = Path("$OUT")
doc = fitz.open(src)

GREEN = (79 / 255, 70 / 255, 229 / 255)
INK = (15 / 255, 23 / 255, 42 / 255)
MUTED = (71 / 255, 85 / 255, 105 / 255)

for i, page in enumerate(doc):
    w, h = page.rect.width, page.rect.height
    if i == 0:
        page.insert_text(
            fitz.Point(48, h - 28),
            "PrepAlign  ·  Intelligence Report  ·  Confidential sample",
            fontsize=7,
            fontname="helv",
            color=MUTED,
        )
        continue
    page.draw_line(
        fitz.Point(42, 30), fitz.Point(w - 42, 30), color=(0.88, 0.9, 0.89), width=0.4
    )
    page.draw_circle(fitz.Point(48, 20), 3.0, color=GREEN, fill=GREEN)
    page.insert_text(fitz.Point(56, 23), "PrepAlign", fontsize=8, fontname="helv", color=INK)
    page.insert_text(
        fitz.Point(w - 198, 23),
        "Weekly Career Intelligence Report",
        fontsize=7,
        fontname="helv",
        color=MUTED,
    )
    page.draw_line(
        fitz.Point(42, h - 34), fitz.Point(w - 42, h - 34), color=(0.88, 0.9, 0.89), width=0.4
    )
    page.insert_text(
        fitz.Point(42, h - 20),
        "PrepAlign Intelligence  ·  Week of July 20-26, 2026  ·  Edition 30",
        fontsize=7,
        fontname="helv",
        color=MUTED,
    )
    page_str = f"{i + 1} / {len(doc)}"
    tw = fitz.get_text_length(page_str, fontname="helv", fontsize=7)
    page.insert_text(
        fitz.Point(w - 42 - tw, h - 20), page_str, fontsize=7, fontname="helv", color=MUTED
    )

doc.save(dst, garbage=4, deflate=True)
print(f"Wrote {dst} ({len(doc)} pages, {dst.stat().st_size} bytes)")
doc.close()
PY
