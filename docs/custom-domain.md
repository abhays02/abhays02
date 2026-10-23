# Connect abhays02.tech through Cloudflare

## What is connected now?

The GitHub Pages API checked on October 23, 2026 reports a built site at
`https://abhays02.github.io/abhays02/` with **no custom domain** (`cname: null`).
That confirms Pages is not configured for `abhays02.tech`; it does not establish
whether another host serves the domain. Public DNS/HTTPS checks could not resolve
the domain from the implementation environment, so its current DNS state is
unverified. No Cloudflare or Vercel account access was available to change DNS,
attach the domain, or verify a production Vercel deployment.

Cloudflare DNS can point a domain to a host; it does not deploy this application.
Choose **one** of the hosting paths below for the apex domain. Do not mix
Vercel and GitHub Pages destination records.

## Recommended: Vercel for the complete portfolio

This repository already has Vercel build settings and serverless API routes.
Unlike static Pages, Vercel can run the AI Gateway and live repository endpoints.

1. Import this repository into Vercel. Use the **repository root**, preset
   **Other**, and production branch **main**. Keep the root `vercel.json` settings.
   Deploy and check the generated HTTPS URL before changing DNS.
2. In that project's **Settings → Domains**, add `abhays02.tech` and
   `www.abhays02.tech`. Make the apex the primary domain and redirect `www` to it.
3. In **Cloudflare → abhays02.tech → DNS → Records**, create the exact record
   type/name/value shown by Vercel for each hostname. Use `@` for the apex.
   Vercel may assign project-specific destinations: copy its current values
   rather than guessing an IP address or using the preview deployment URL.
4. Set those web records to **DNS only** (grey cloud) while Vercel verifies DNS
   and provisions HTTPS. Remove only conflicting web destination records for
   the same names. Preserve mail MX/TXT records and unrelated subdomains.
   Add any ownership-verification TXT record Vercel requests.
5. Wait for Vercel to show valid configuration and an issued certificate.
   Leave Cloudflare proxying off for the simplest setup. If enabling it later,
   use **Full (strict)** TLS, not Flexible, and recheck redirects and APIs.
6. If `PUBLIC_ORIGIN` is already set to an old hostname, update it to
   `https://abhays02.tech` and redeploy, or remove it to use the existing
   same-origin handling for deployment aliases. If Turnstile is enabled, add
   the new hostname to its allowed hostnames.

No `CNAME` file is needed for Vercel. Do not configure this domain in GitHub
Pages as well.

## Alternative: GitHub Pages for the static portfolio

This keeps the visual portfolio and local resume guide, **not** the Node APIs
or hosted AI Gateway.

1. Verify ownership under your GitHub account's **Settings → Pages** using
   GitHub's supplied TXT record in Cloudflare. Keep that verification record.
2. In this repository's **Settings → Pages → Custom domain**, save
   `abhays02.tech` **before** pointing DNS at Pages. The existing branch-based
   publisher uses `gh-pages`; GitHub adds `CNAME` there. Preserve it on future
   static publishes. A file on `main` alone would not configure this publisher.
3. In Cloudflare, add these **DNS only** records:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | abhays02.github.io |

   Remove conflicting web destination records at `@` and `www`, including
   stale AAAA records if they point elsewhere. Do not add a wildcard record.
   Do not put `/abhays02/` in a DNS value.
4. Wait for the Pages DNS check/certificate, then enable **Enforce HTTPS**.
   Allow up to 24 hours for DNS propagation. Leave the records DNS only while
   diagnosing certificate or redirect problems.
5. Keep `backend: false` in the published static `site-config.json`. At the
   custom domain the site is served at `/`, not `/abhays02/`; the current
   relative asset links support both.

## Verify before calling it connected

Open `https://abhays02.tech` and `https://www.abhays02.tech`. Confirm a valid
certificate, the intended portfolio, a single redirect to the primary hostname,
loaded images/resume, and working social/contact links. On Vercel, also check
`/api/status` and a guide request; a responding site does not prove AI is enabled.

Only after verification, replace the portfolio URL in the root README with
`https://abhays02.tech/`. The current README deliberately keeps the existing
Pages URL instead of sending visitors to an unverified domain.

References: [Vercel domain setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain),
[GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
[Cloudflare DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/).
