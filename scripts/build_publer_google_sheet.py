#!/usr/bin/env python3
"""
Build a Publer-ready social calendar matrix for Google Sheets / CSV import.

Reads launch/social-calendar-30-day.md and writes:
  - publer-bulk-upload.csv          (UTF-8 BOM, paste/import into Google Sheets)
  - launch/publer-google-sheet.csv  (same matrix, kept next to the source calendar)

Official Publer template columns (do not reorder/remove):
  1. Date - Intl. format or prompt
  2. Text
  3. Link
  4. Media URL
  5. Title
  6. Label
  7. Alt text(s)
  8. Comment(s)
  9. Pin board, FB album, or Google category
 10. Post subtype - I.e. story, reel, PDF ..
 11. CTA - For Facebook links or Google
 12. Reminder

Usage:
  python3 scripts/build_publer_google_sheet.py
  DEMO_URL=https://ai-dev-starter-seven.vercel.app python3 scripts/build_publer_google_sheet.py

Optional Google Sheets upload (if credentials are configured):
  GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/sa.json \\
  GOOGLE_SHEET_ID=optional_existing_id \\
  python3 scripts/build_publer_google_sheet.py --upload
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
from datetime import date, datetime, timedelta, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CALENDAR_PATH = ROOT / "launch" / "social-calendar-30-day.md"
ROOT_CSV = ROOT / "publer-bulk-upload.csv"
LAUNCH_CSV = ROOT / "launch" / "publer-google-sheet.csv"

DEFAULT_DEMO_URL = "https://ai-dev-starter-seven.vercel.app"
START_DATE = date(2026, 10, 18)
END_DATE = date(2026, 11, 16)
POST_TIME = time(10, 0)

PUBLER_HEADERS = [
    "Date - Intl. format or prompt",
    "Text",
    "Link",
    "Media URL",
    "Title",
    "Label",
    "Alt text(s)",
    "Comment(s)",
    "Pin board, FB album, or Google category",
    "Post subtype - I.e. story, reel, PDF ..",
    "CTA - For Facebook links or Google",
    "Reminder",
]


def clean_message(raw: str, demo_url: str) -> str:
    """Flatten markdown post body into a single caption; keep emojis/formatting."""
    lines = [line.rstrip() for line in raw.replace("\r\n", "\n").split("\n")]
    text = " ".join(line for line in lines if line.strip())
    text = re.sub(r"[ \t]+", " ", text).strip()
    # Normalize CTA arrow to an em dash for readable social copy
    text = text.replace("→", "—")
    # Ensure demo links point at the configured sandbox
    text = re.sub(
        r"https://ai-dev-starter-seven\.vercel\.app(?:/pricing)?",
        lambda m: f"{demo_url.rstrip('/')}/pricing"
        if m.group(0).endswith("/pricing")
        else demo_url.rstrip("/"),
        text,
    )
    return text


def parse_calendar(path: Path, demo_url: str) -> list[str]:
    md = path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"### Day (\d+) —[^\n]*\n([\s\S]*?)(?=\n### Day |\n---\n)",
    )
    posts: dict[int, str] = {}
    for match in pattern.finditer(md):
        day = int(match.group(1))
        posts[day] = clean_message(match.group(2), demo_url)

    missing = [d for d in range(1, 31) if d not in posts]
    if missing:
        raise SystemExit(f"Missing calendar days in {path}: {missing}")

    return [posts[d] for d in range(1, 31)]


def build_rows(messages: list[str]) -> list[list[str]]:
    rows: list[list[str]] = [PUBLER_HEADERS[:]]
    day_count = (END_DATE - START_DATE).days + 1
    if day_count != 30 or len(messages) != 30:
        raise SystemExit(
            f"Expected 30 days/messages, got day_count={day_count}, messages={len(messages)}"
        )

    for offset, message in enumerate(messages):
        scheduled = datetime.combine(START_DATE + timedelta(days=offset), POST_TIME)
        # Publer intl format: YYYY-MM-DD HH:MM
        date_value = scheduled.strftime("%Y-%m-%d %H:%M")
        row = [date_value, message] + [""] * (len(PUBLER_HEADERS) - 2)
        rows.append(row)
    return rows


def write_csv(path: Path, rows: list[list[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # utf-8-sig => BOM so Google Sheets / Excel preserve emoji + unicode
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(
            handle,
            quoting=csv.QUOTE_ALL,
            lineterminator="\n",
        )
        writer.writerows(rows)


def maybe_upload_google_sheet(rows: list[list[str]]) -> str | None:
    """
    Optional upload via a Google service account.
    Requires:
      pip install gspread google-auth
      GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
      GOOGLE_SHEET_ID=existing_sheet_id (optional; creates a new spreadsheet if omitted)
    """
    sa_path = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    if not sa_path:
        return None

    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError as exc:
        raise SystemExit(
            "Google upload requested but gspread/google-auth are not installed.\n"
            "Install with: pip install gspread google-auth"
        ) from exc

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_file(sa_path, scopes=scopes)
    client = gspread.authorize(creds)

    sheet_id = os.environ.get("GOOGLE_SHEET_ID", "").strip()
    title = "AI Dev Starter — Publer 30-Day Calendar"

    if sheet_id:
        spreadsheet = client.open_by_key(sheet_id)
    else:
        spreadsheet = client.create(title)

    worksheet = spreadsheet.sheet1
    worksheet.clear()
    worksheet.update(range_name="A1", values=rows)
    worksheet.update_title("Publer CSV")

    # Share hint: service-account-created sheets need an owner share for humans
    return spreadsheet.url


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--upload",
        action="store_true",
        help="Also upload to Google Sheets when GOOGLE_SERVICE_ACCOUNT_JSON is set",
    )
    args = parser.parse_args()

    demo_url = os.environ.get("DEMO_URL", DEFAULT_DEMO_URL).strip() or DEFAULT_DEMO_URL
    messages = parse_calendar(CALENDAR_PATH, demo_url)
    rows = build_rows(messages)

    write_csv(ROOT_CSV, rows)
    write_csv(LAUNCH_CSV, rows)

    print(f"Wrote {ROOT_CSV.relative_to(ROOT)}")
    print(f"Wrote {LAUNCH_CSV.relative_to(ROOT)}")
    print(f"Rows: {len(rows) - 1} posts ({START_DATE} → {END_DATE} at 10:00)")
    print(f"Demo URL: {demo_url}")
    print("Paste into Google Sheets: File → Import → Upload, or open the CSV and copy all cells.")

    if args.upload:
        url = maybe_upload_google_sheet(rows)
        if url:
            print(f"Google Sheet: {url}")
        else:
            print(
                "Upload skipped: set GOOGLE_SERVICE_ACCOUNT_JSON to enable --upload.",
                file=sys.stderr,
            )
            return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
