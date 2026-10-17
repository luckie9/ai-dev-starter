#!/usr/bin/env python3
"""
Generate publer-bulk-upload.csv for Publer / Google Sheets import.

- Official Publer template headers (Date-first, 12 columns)
- 30 posts: 2026-10-18 → 2026-11-16 at 10:00
- Multi-line captions with generous blank lines + rich emojis
- Every cell fully double-quoted (csv.QUOTE_ALL)
- UTF-8 BOM for Sheets / Excel emoji safety

Usage:
  python3 scripts/build_publer_bulk_upload.py
  npm run publer:csv
"""

from __future__ import annotations

import csv
import os
from datetime import date, datetime, timedelta, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_CSV = ROOT / "publer-bulk-upload.csv"
LAUNCH_CSV = ROOT / "launch" / "publer-google-sheet.csv"

DEMO_URL = os.environ.get(
    "DEMO_URL", "https://ai-dev-starter-seven.vercel.app"
).rstrip("/")
PRICING_URL = f"{DEMO_URL}/pricing"

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


def posts(demo: str, pricing: str) -> list[str]:
    """30 captions: blank-line spacing + rockets / fire / arrows / sparkles."""
    return [
        # Day 1
        f"""🚀 Stop spending weeks on auth, billing, and deploy glue.

✨ AI Dev Starter is Zero-Human-Click shipping with Cursor + Vercel.

👉 Try the live sandbox:
{demo}""",
        # Day 2
        f"""⚡ Minutes > weeks.

🔥 Spin up a production-ready SaaS shell before your coffee cools.

➡️ Open the demo:
{demo}""",
        # Day 3
        f"""💻 Build with Cursor. Deploy with Vercel.

🚀 Skip the boilerplate grind.

👉 Click around the interactive dashboard:
{demo}""",
        # Day 4
        f"""😤 Founders don’t need another “tutorial app.”

🚢 You need a stack that ships.

➡️ Launch path starts here:
{demo}""",
        # Day 5
        f"""⚙️ Zero-Human-Click architecture isn’t a buzzword.

✨ It’s automating the boilerplate so you focus on product.

🔥 Test drive the codebase:
{demo}""",
        # Day 6
        f"""🧱 Next.js + Supabase + Stripe — pre-wired for real SaaS.

🚀 Explore the sandbox:
{demo}""",
        # Day 7
        f"""🛠️ Weekend project energy.

💪 Production-grade foundation.

➡️ Start in the live app:
{demo}""",
        # Day 8
        f"""📈 Maximum ROI = less time on plumbing, more time on product.

✨ Tour the starter live:
{demo}""",
        # Day 9
        f"""⏪ Before: auth, RLS, Stripe webhooks, deploy config.

⏩ After: open the sandbox and ship.

🚀 {demo}""",
        # Day 10
        f"""👨‍💻 Developers: stop reinventing checkout + session middleware.

👉 Click the demo:
{demo}""",
        # Day 11
        f"""☁️ Built for Vercel from day one — push `main`, go live.

🔥 Production sandbox:
{demo}""",
        # Day 12
        f"""🧠 Describe the feature. Let Cursor implement. Deploy on Vercel.

🔁 That’s the loop.

✨ Watch the UI in action:
{demo}""",
        # Day 13
        f"""✅ Auth ✅
✅ DB + RLS ✅
✅ Billing path ✅
✅ Dashboard shell ✅

➡️ Verify in the live app:
{demo}""",
        # Day 14
        f"""⏳ Halfway through your “someday SaaS”? Skip ahead.

🚀 {demo}""",
        # Day 15
        f"""🎯 The hero isn’t a screenshot — it’s a live dashboard mock that feels real.

🔥 Play with it:
{demo}""",
        # Day 16
        f"""💳 Subscriptions shouldn’t take a sprint.

💎 Pro path is $29/mo when you’re ready to bill.

➡️ See pricing in-product:
{pricing}""",
        # Day 17
        f"""🗄️ Supabase Auth + Postgres RLS without the setup spiral.

✨ Sandbox:
{demo}""",
        # Day 18
        f"""🏁 Challenge: go from clone → idea screen in under an hour.

⚡ We already cleared the boring parts.

🚀 {demo}""",
        # Day 19
        f"""📺 Less “follow 40 YouTube tabs.”

🚢 More “deploy and customize.”

👉 Live app:
{demo}""",
        # Day 20
        f"""⏱️ Time is your scarcest capital.

💼 Spend it on customers, not boilerplate.

➡️ {demo}""",
        # Day 21
        f"""⚡ High-speed deployment isn’t luck — it’s a stack choice.

🔥 Cursor + Vercel + AI Dev Starter.

🚀 Try it:
{demo}""",
        # Day 22
        f"""👀 What if your MVP was live before the next standup?

✨ Open the sandbox:
{demo}""",
        # Day 23
        f"""🧩 App Router. Server Components. Webhooks that sync subscriptions.

➡️ See the shell:
{demo}""",
        # Day 24
        f"""📌 Bookmark this for your next build:

🚀 Zero-Human-Click SaaS starter.

👉 {demo}""",
        # Day 25
        f"""🐢 Slow stack: weeks of glue code.

⚡ Fast stack: Cursor, Vercel, AI Dev Starter.

🔥 Demo:
{demo}""",
        # Day 26
        f"""🛠️ Indie hackers: ship the wedge, not the infrastructure novel.

🚀 {demo}""",
        # Day 27
        f"""⏰ Every week without a live MVP is a week of delayed learning.

➡️ Start here:
{demo}""",
        # Day 28
        f"""✨ Auth routes, dashboard, pricing, Stripe-ready wiring — one repo.

🔥 Click through live:
{demo}""",
        # Day 29
        f"""👨‍💻 Devs get clean structure.

📈 Founders get speed-to-revenue.

👉 Sandbox:
{demo}""",
        # Day 30
        f"""🗓️ 30 days from now you’ll wish you deployed today.

🚀 AI Dev Starter — Zero-Human-Click with Cursor & Vercel.

🔥 Go live in the sandbox:
{demo}""",
    ]


def normalize(text: str) -> str:
    """Normalize newlines; keep blank lines between beats."""
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(line.rstrip() for line in lines).strip() + "\n"


def build_rows(messages: list[str]) -> list[list[str]]:
    day_count = (END_DATE - START_DATE).days + 1
    if day_count != 30 or len(messages) != 30:
        raise SystemExit(
            f"Expected 30 days/messages, got day_count={day_count}, messages={len(messages)}"
        )

    rows: list[list[str]] = [PUBLER_HEADERS[:]]
    for offset, message in enumerate(messages):
        scheduled = datetime.combine(START_DATE + timedelta(days=offset), POST_TIME)
        date_value = scheduled.strftime("%Y-%m-%d %H:%M")
        row = [date_value, normalize(message)] + [""] * (len(PUBLER_HEADERS) - 2)
        rows.append(row)
    return rows


def write_csv(path: Path, rows: list[list[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(
            handle,
            quoting=csv.QUOTE_ALL,
            lineterminator="\n",
            doublequote=True,
        )
        writer.writerows(rows)


def main() -> int:
    messages = posts(DEMO_URL, PRICING_URL)
    rows = build_rows(messages)
    write_csv(OUT_CSV, rows)
    write_csv(LAUNCH_CSV, rows)

    # Sanity: every cell quoted, multiline Text present
    raw = OUT_CSV.read_text(encoding="utf-8-sig")
    if not raw.startswith('"Date - Intl. format or prompt"'):
        raise SystemExit("CSV header not fully quoted")
    if raw.count("🚀") < 10:
        raise SystemExit("Expected rich emojis in generated posts")
    if "\n\n" not in raw:
        raise SystemExit("Expected blank-line spacing inside Text cells")

    print(f"Wrote {OUT_CSV.relative_to(ROOT)}")
    print(f"Wrote {LAUNCH_CSV.relative_to(ROOT)}")
    print(f"Rows: {len(rows) - 1} posts ({START_DATE} → {END_DATE} at 10:00)")
    print(f"Demo URL: {DEMO_URL}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
