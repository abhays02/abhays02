"""Generate small profile cards from public GitHub REST data; no dependencies."""

import argparse
from collections import Counter
from datetime import datetime, timezone
from html import escape
import json
from pathlib import Path
import subprocess


USERNAME = "abhays02"
COLORS = ("#43e7f4", "#a78bfa", "#719bff", "#56c9b5", "#b4a0ed")


def fetch_repositories():
    result = subprocess.run(
        [
            "gh", "api", "--paginate", "--slurp",
            f"users/{USERNAME}/repos?type=owner&per_page=100",
        ],
        check=True, stdout=subprocess.PIPE, text=True,
    )
    return [repo for page in json.loads(result.stdout) for repo in page]


def summarize(repositories):
    public = [
        repo for repo in repositories
        if not repo["private"] and repo["owner"]["login"].lower() == USERNAME
    ]
    original = [repo for repo in public if not repo["fork"]]
    languages = Counter(repo["language"] for repo in original if repo["language"])
    return {
        "public": len(public),
        "original": len(original),
        "stars": sum(repo["stargazers_count"] for repo in original),
        "languages": sorted(languages.items(), key=lambda item: (-item[1], item[0]))[:5],
    }


def card(title, description, content, updated):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="440" height="244" viewBox="0 0 440 244" role="img" aria-labelledby="title desc">
  <title id="title">{escape(title)}</title>
  <desc id="desc">{escape(description)}</desc>
  <rect x="1" y="1" width="438" height="242" rx="12" fill="#080d17" stroke="#243349"/>
  <g font-family="ui-monospace, SFMono-Regular, Consolas, monospace">
    <path d="M24 52H416M24 208H416" stroke="#243349"/>
    <text x="24" y="32" fill="#43e7f4" font-size="12" letter-spacing="1.4">{escape(title)}</text>
    {content}
    <text x="24" y="229" fill="#91a3bc" font-size="10">PUBLIC API / {escape(updated)} UTC</text>
  </g>
</svg>
"""


def render_cards(summary, updated):
    metrics = (
        ("PUBLIC REPOSITORIES", summary["public"]),
        ("ORIGINAL PUBLIC REPOS", summary["original"]),
        ("STARS / ORIGINAL REPOS", summary["stars"]),
    )
    overview = "\n".join(
        f'<text x="24" y="{87 + i * 48}" fill="#b5c6dc" font-size="12">{label}</text>'
        f'<text x="412" y="{90 + i * 48}" text-anchor="end" fill="#f0f5ff" font-size="26">{value}</text>'
        for i, (label, value) in enumerate(metrics)
    )
    rows = summary["languages"]
    language_content = '<text x="24" y="75" fill="#91a3bc" font-size="10">ORIGINAL REPOS / PRIMARY LANGUAGE / TOP 5</text>'
    maximum = max((count for _, count in rows), default=1)
    for i, (language, count) in enumerate(rows):
        y = 97 + i * 22
        language_content += (
            f'<text x="24" y="{y}" fill="#b5c6dc" font-size="12">{escape(language)}</text>'
            f'<rect x="180" y="{y - 8}" width="{190 * count / maximum:.1f}" height="5" rx="2" fill="{COLORS[i]}"/>'
            f'<text x="412" y="{y}" text-anchor="end" fill="#f0f5ff" font-size="12">{count}</text>'
        )
    if not rows:
        language_content += '<text x="24" y="123" fill="#b5c6dc" font-size="12">No primary languages reported by GitHub.</text>'
    description = "; ".join(f"{label}: {value}" for label, value in metrics)
    return {
        "public-stats.svg": card("PUBLIC REPOSITORY SIGNALS", description, overview, updated),
        "repo-languages.svg": card(
            "LANGUAGE FOOTPRINT",
            "Number of original public repositories by primary language, not code volume. "
            + (", ".join(f"{language}: {count}" for language, count in rows) or "No languages reported."),
            language_content, updated,
        ),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    summary = summarize(fetch_repositories())
    updated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for filename, svg in render_cards(summary, updated).items():
        args.output_dir.joinpath(filename).write_text(svg, encoding="utf-8")
    print(f"Generated public API cards for {USERNAME} in {args.output_dir}")


if __name__ == "__main__":
    main()
