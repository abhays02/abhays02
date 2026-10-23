# Profile dashboard maintenance

The root README is the profile entry point. The `portfolio/`, API,
Vercel configuration, and published `gh-pages` site have separate deployment
lifecycles; source edits do not by themselves update the published site.

## Published assets and refresh permissions

The `output` images are real snapshots generated locally from GitHub data.
**Scheduled refresh is not installed:** the publishing session can write
repository content, but GitHub rejected installation of a workflow because its
App token lacks Workflows write permission. The profile does not claim a daily
refresh or a successful GitHub-hosted run.

To enable automatic updates, use a repository account authorized to edit
workflows:

1. Create `.github/workflows/profile-assets.yml` on `main` using the complete
   configuration below. This is a manual, authorized installation; the
   documentation itself does not execute it.
2. Open **Actions → Refresh profile assets → Run workflow**, selecting `main`.
   Installation on `main` also triggers a run; the daily schedule is
   **04:23 UTC**, subject to GitHub scheduling delays.
3. Confirm the run is green and the `output` branch contains
   `public-stats.svg`, `repo-languages.svg`, `github-snake.svg`, and
   `github-snake-dark.svg`. Check the README images after GitHub's cache refreshes.

No personal access token or additional secret is required. The workflow uses the
automatic `GITHUB_TOKEN`, with `contents: read` by default and `contents: write`
on the publishing job. Checkout does not persist credentials. Only the dedicated
generated `output` branch is force-replaced; never put hand-maintained content
there. `main` and `gh-pages` are not pushed by the workflow.

If Actions is disabled, enable it in **Settings → Actions → General**. If an
action is blocked, allow the pinned official `actions/checkout` action and
`Platane/snk`. If publishing returns 403, ask a repository/organization admin to
allow the workflow's explicit `contents: write` permission and permit the
`output` branch update under any applicable ruleset. Do not grant broad
permissions or introduce a PAT to bypass repository policy.

GitHub may disable scheduled workflows in inactive public repositories; re-enable
the workflow in Actions if that happens. A failed generation step stops the
workflow before publishing, leaving the previous snapshot intact.

## Data, design, and editing

- `assets/neural-header.svg` is original, self-contained SVG artwork. Its
  typewriter animation uses SVG-internal CSS, not scripts or unsupported README
  styling. Reduced-motion preferences show a static first role. The headline
  and introduction remain normal text outside the image.
- `assets/project-paths.svg` is an architecture illustration, not a screenshot
  or an assertion that a hosted service is operating.
- `assets/neural-footer.svg` closes the same cyan/violet visual system.
- `assets/button-*.svg` are self-contained raised link faces for the portfolio,
  email, LinkedIn, Google Developer, and Instagram. GitHub READMEs do not execute
  custom JavaScript or page CSS; the real hover/focus/press effects live in the
  portfolio's contact section, not inside README images.
- `scripts/profile_stats.py` uses Python's standard library and the GitHub CLI,
  already available on the hosted runner. Public REST pagination is explicit.
  Private repositories, forks' stars, and repositories owned by other accounts
  do not contribute to original-repository metrics.
- Language counts mean **original public repositories by GitHub primary
  language**, not bytes, proficiency, or all dependencies. Only the five most
  common are shown. The UTC snapshot time is embedded in each generated card.
- `Platane/snk/svg-only` generates both snake themes from `abhays02`'s contribution
  calendar. Color query parameters and filenames follow the
  [upstream documentation](https://github.com/Platane/snk#usage).
- Generated images use raw URLs on `output`; local design assets use relative
  paths. No third-party statistics or typing-image service is required.
- When updating pinned action SHAs, inspect their release notes and `action.yml`.
  The current pins resolve to checkout `v7.0.1` and snake `v3`.

Run the focused checks with:

```sh
python3 -m unittest discover -s scripts -p 'test_profile_stats.py'
# Requires an authenticated GitHub CLI; output should be outside the source tree.
python3 scripts/profile_stats.py --output-dir /tmp/abhays02-profile-preview
```

## Content evidence and deliberate omissions

The profile copy was checked against public source and documentation:

| Content | Evidence |
| :--- | :--- |
| AI/ML, full-stack learning, collaboration | Previous root README |
| ICR manual review and limitations | `ICR-Studios/README.md`, `docs/STATUS.md`, `studio/package.json`, `pyproject.toml` |
| Local news-classification baseline | `fakenews-Detection/model/api_server.py`, `model/train.py`, root README |
| Feastwala stack and ordering paths | `feastwala/package.json`, `server.js`, `routes/webRouter.js` |
| Movie recommendations | Code cells in `Movie-Recommendation-System/recommender.ipynb`: TF-IDF on overviews and `sigmoid_kernel`; collaborative filtering was not established |
| Small ML experiments | `grokking-silence/README.md` and its documented experiment files |

The social handles were supplied by the owner as `abhays02`; Google Developer
was explicitly confirmed as `g.dev/abhays02`. LinkedIn is also present in the
portfolio resume. These links are not claims of independently verified account
availability. The portfolio link uses the URL returned by the Pages API; no
custom-domain connection is claimed. See [domain setup](custom-domain.md) for
the verified configuration state and remaining Cloudflare/hosting steps.
No employment, education, proficiency ratings, or product metrics are added here.

The workflow configuration and locally generated animation are not proof of a
successful GitHub-hosted run. Use the actual Actions run result to establish
that automatic refresh is functioning.

## Workflow for authorized installation

Save the following as `.github/workflows/profile-assets.yml`. No generated SVGs
belong on `main`.

```yaml
name: Refresh profile assets

on:
  schedule:
    - cron: "23 4 * * *"
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - .github/workflows/profile-assets.yml
      - scripts/profile_stats.py
      - scripts/test_profile_stats.py

permissions:
  contents: read

concurrency:
  group: profile-output
  cancel-in-progress: false

jobs:
  generate:
    if: github.repository == 'abhays02/abhays02'
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: write # Required only to publish generated SVGs to output.
    steps:
      - name: Check out source
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      - name: Check statistics generator
        run: python3 -m unittest discover -s scripts -p 'test_profile_stats.py'

      - name: Generate public repository cards
        env:
          GH_TOKEN: ${{ github.token }}
        run: python3 scripts/profile_stats.py --output-dir "$RUNNER_TEMP/profile-output"

      - name: Generate contribution snakes
        uses: Platane/snk/svg-only@d8f6715049803e982ee5ff501b6b9b7d5deeb09b # v3
        with:
          github_user_name: abhays02
          github_token: ${{ github.token }}
          outputs: |
            ${{ runner.temp }}/profile-output/github-snake.svg?color_snake=%230e7490&color_dots=%23edf2f7,%23cffafe,%2367e8f9,%2322d3ee,%230891b2
            ${{ runner.temp }}/profile-output/github-snake-dark.svg?palette=github-dark&color_snake=%2343e7f4&color_dots=%230d1726,%231b3150,%233b5b9a,%237b6ce0,%23a78bfa

      - name: Validate generated SVGs
        run: |
          python3 - <<'PY'
          import os
          from pathlib import Path
          from xml.etree import ElementTree
          folder = Path(os.environ["RUNNER_TEMP"]) / "profile-output"
          for name in ("public-stats.svg", "repo-languages.svg", "github-snake.svg", "github-snake-dark.svg"):
              path = folder / name
              ElementTree.parse(path)
              if path.stat().st_size > 1_000_000:
                  raise ValueError(f"Oversized profile asset: {name}")
          PY

      - name: Publish generated assets
        env:
          GH_TOKEN: ${{ github.token }}
          TARGET_REPOSITORY: ${{ github.repository }}
        run: |
          set -euo pipefail
          gh auth setup-git
          cd "$RUNNER_TEMP/profile-output"
          git init --initial-branch=output
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -- public-stats.svg repo-languages.svg github-snake.svg github-snake-dark.svg
          git commit -m "Refresh generated profile assets"
          git remote add origin "https://github.com/$TARGET_REPOSITORY.git"
          # output is generated-only; replacing it keeps animation history small.
          git push --force origin HEAD:refs/heads/output
```
