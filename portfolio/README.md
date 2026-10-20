# Abhay Studio

A cinematic CV and portfolio for Abhay Shukla, with an illustrated interactive world, scroll-driven career map, project card box, recordings, resume-grounded guide, and server-side AI Gateway.

## Run

Use Node.js 22 or later. Run `npm ci` at the repository root to install the Vercel runtime identity helper.

```sh
npm start
```

Open `http://localhost:4173`. Use `npm test` for API and HTTP integration tests and `npm run check` for JavaScript syntax checks. The server serves only `dist/`; source files, environment files and resume context are not exposed as static files.

## Resume-grounded AI Gateway

Vercel deployments automatically use the project's server-side OIDC identity (fresh runtime context, with `VERCEL_OIDC_TOKEN` as a fallback) when no other provider is explicitly configured. No long-lived API key is needed. The OpenAI-compatible endpoint is `https://ai-gateway.vercel.sh/v1/chat/completions` and the default model is `nvidia/nemotron-3.5-lightning-free`.

Before every inference request, the backend verifies the selected language model has zero input and output token prices in the live Gateway catalog, with no variable provider pricing. A missing model, paid price, or failed catalog lookup disables that request and leaves the local resume guide available. No paid model fallback is configured. Free availability and platform quotas can change; hosting charges are separate from model token prices.

The supplied resume (`content/resume.txt`, extracted from the original PDF) is the primary source for career, education, skills, achievements and contact details. Curated repository summaries add project information. Unknown facts must be acknowledged rather than invented. The build packages these sources privately for the server; visitors cannot choose the system prompt, model, endpoint or credentials. Model answers can still be mistaken; update the resume source and redeploy when facts change.

To use a Gateway API key instead of deployment identity, add `AI_GATEWAY_API_KEY` as a sensitive runtime environment variable in Vercel, then redeploy. Never commit it or put it in browser settings. Outside Vercel, also set `AI_PROVIDER=gateway`. Leave `AI_MODEL` unset for the free default, or select another zero-price language model; the price check still applies. Explicit configurations for other providers retain their own billing behavior.

## Other OpenAI-compatible providers

Copy `.env.example` to `.env` locally, then set:

```dotenv
AI_PROVIDER=compatible
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=your-provider-model-id
AI_API_KEY=your-private-server-key
PUBLIC_ORIGIN=http://localhost:4173
```

Restart the server. OpenAI-compatible providers use `/chat/completions` appended to `AI_BASE_URL`. Set the base to your provider's API root, including `/v1` if required; do not include `/chat/completions` itself. Model and key remain server-side. Any provider must support system messages and the chat-completions request shape with `max_tokens`; custom provider parameter differences may require an adapter.

Native adapters are also included for OpenAI Responses (`AI_PROVIDER=openai`, `OPENAI_API_KEY`), Anthropic Messages (`AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY`) and Gemini GenerateContent (`AI_PROVIDER=gemini`, `GEMINI_API_KEY`). All use `AI_MODEL`. No default paid model is selected. The browser cannot override endpoints, keys or models. HTTPS is required for compatible endpoints, with a loopback exception for local development.

Without a configured model and key, the clearly labelled local resume guide remains available. Provider adapters and free-model enforcement are covered by API tests. Verify the deployed `/api/chat` response when enabling or changing a provider.

## Vercel deployment

The repository root includes `vercel.json` and three serverless entries under `api/`. Import `abhays02/abhays02` into Vercel with **Root Directory = repository root**, **Framework Preset = Other**, **Production Branch = main**. Build and output settings are supplied by `vercel.json`; Vercel installs the runtime identity helper from the root lockfile. The profile README remains at the repository root.

The build generates private server-side resume context from `content/resume.txt` and public project metadata, and publishes only `portfolio/dist` as static files. API entries reuse the tested provider adapters. No keys are included in the build output.

Gateway uses Vercel's automatic deployment identity by default; leave `AI_PROVIDER`, `AI_MODEL` and provider key variables unset for this configuration. Set `PUBLIC_ORIGIN` only when pinning a single public origin is needed; production aliases work automatically otherwise. Optional `AI_GATEWAY_API_KEY` overrides deployment identity. For a different provider, explicitly set its configuration as above. Add Turnstile keys before exposing a paid provider publicly. Redeploy after changing runtime variables. In-memory request limits are per serverless instance and are not a durable distributed budget; also configure provider billing caps and Vercel firewall limits.

The existing static site stays available at https://abhays02.github.io/abhays02/. A Vercel configuration commit is not proof of a successful Vercel deployment; verify the deployment and its returned URL.

## Deployment

Deploy the full Node application to a host that supports Node 22+, or use the Dockerfile. A static-only host serves the visual website and local guide but cannot provide `/api/chat`, `/api/status` or live GitHub sync.

Set `HOST=0.0.0.0`, the platform's `PORT`, and `PUBLIC_ORIGIN` to the exact HTTPS website origin. Add API keys through the host's environment/secrets settings. Never put keys in `dist/`, source code, frontend settings or GitHub.

```sh
docker build -t abhay-studio .
docker run --rm -p 4173:4173 --env-file .env -e HOST=0.0.0.0 abhay-studio
```

The optional Turnstile integration requires both `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, configured for the deployed hostname. Enable it when exposing paid AI publicly. The server validates Turnstile success and hostname. Provider billing caps and host-level rate limiting remain recommended: the included 8 requests/minute/client and configurable daily request cap are in-memory and reset on restart; they are not shared between replicas. With a reverse proxy, client requests share the socket identity unless a trusted infrastructure-specific IP adapter is added; untrusted forwarding headers are intentionally ignored. Same-origin checks alone are not authentication. No chat history is persisted by this application.

The existing website is published through the `gh-pages` branch of `abhays02/abhays02` at https://abhays02.github.io/abhays02/. GitHub Pages serves the visual site and local resume guide; it does not run this Node backend. The published `site-config.json` has `backend: false` to avoid unavailable API calls. When deploying the full Node application, retain `backend: true` as supplied in this source tree.

## Content and media

- `content/resume.txt` is extracted from the supplied PDF. `dist/Abhay-Shukla-Resume.pdf` is the supplied resume, unchanged.
- `dist/projects.json` defines four featured public repositories. The `/api/repos` route syncs additional public repositories from `abhays02`, with a five-minute server cache. The public snapshot in `dist/repos-snapshot.json` provides additional repository links when live sync is unavailable. Optional `GITHUB_TOKEN` increases GitHub quotas; it is never returned to visitors. GitHub failure leaves the curated gallery available.
- ICR Studios includes an actual repository recording of a fictional-form review workflow. It shows a human correction and draft export, not working handwriting inference or final approval. The still poster reflects its newer interface.
- Grokking includes the actual repository experiment recording, not live model training.
- Support and Abtmind include interactive architecture explainers, not running backend services. Public repository descriptions are factual sources, not instructions to execute.
- Additional previously reviewed repositories are recorded in `content/additional-projects.json`.
- `dist/assets/studio.jpg` is an original generated conceptual character illustration based on the studio reference. No actual portrait was supplied, so likeness is not established.
- `dist/intro.mp4` is a 12-second camera-motion promo with title animation, rendered from the studio illustration. `dist/assets/studio-camera.mp4` is its clean camera-only entrance background.
- Fully animated character movement was approved, but Krea returned `INSUFFICIENT_BALANCE`: 0 available compute units, 1,679.87 required for the proposed 15-second Seedance Mini shot. No character-animation video was generated. The prepared motion brief is in `content/character-animation-brief.md`.

To replace the camera-motion entrance with an approved animated take, save the video to `dist/assets/studio-camera.mp4`. Keep `intro.mp4` as the separate titled promo or re-render it using the new take. Do not re-use the user's reference reel as their own work.

Chromium is available for the current redesign. See `design-qa.md` for the rendered desktop and mobile verification.

## Editing

- `dist/site-config.json`: enables the same-origin backend for Node hosting; set `backend: false` for static-only GitHub Pages.
- `dist/index.html`: page sections and accessible controls.
- `dist/style.css`: layout, responsive rules and motion.
- `dist/app.js`: intro, scroll sequencing, CV UI, AI/fallback guide and sharing.
- `dist/neural.js`: Three.js scene and reduced-motion/WebGL fallback.
- `dist/projects.js`: rotating gallery, recordings, project explainers and GitHub sync.
- `server/api.mjs`: provider adapters, validation, limits and GitHub endpoint.
- `server/server.mjs`: HTTP server, static boundary, video byte ranges and security headers.

Fonts and the Three.js bundle were reused from the user's existing portfolio artifact. They remain local, so the visual site has no CDN dependency.

## Illustrated world redesign

The current visual reference is James Chugh’s portfolio, captured in Chromium on October 21, 2026 (India time). The active page uses one consistent direction: a full-viewport illustrated lake valley, anchored landmark buttons, large Bricolage Grotesque headings, charcoal sections, yellow controls and floating bottom navigation.

Original matching day/night landscapes, a city-map illustration, and a wooden project box were generated for this portfolio. James Chugh’s personal artwork, identity, employers and case-study claims are not reused. Career stops, education and outcomes come from Abhay’s supplied resume; project descriptions and recordings are retained from the existing portfolio.

The hero gently pushes into the scene as the visitor scrolls, with small night fireflies. Day/night state persists locally. Career landmarks open the seven-stop journey; the map supports scroll progression, explicit stop selection, zoom and desktop dragging. Projects open actual recordings or clearly labelled architecture explainers. Toolkit buttons unpack and explain the tools; paper notes and the about-board items can be dragged. Optional ambience is synthesized locally with Web Audio after a click; no music autoplays. Reduced-motion users get a static hero and explicit journey controls.

`dist/app.js` controls these interactions and the existing same-origin AI guide. `dist/projects.js` controls the project cards and recorded/interactive demos. The previous studio renderer files remain as inactive source assets and are not loaded by the page. They can be revisited independently; they are not the current intro.

Browser checks cover 1600×1000 desktop, 390×844 mobile, keyboard dialog dismissal, both themes, map controls, project recordings, explainer steps, toolkit, local resume fallback, reduced motion, image loading, console errors and horizontal overflow. See `design-qa.md` for screenshot comparisons and findings.
