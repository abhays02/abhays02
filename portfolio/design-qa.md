# Illustrated-world redesign QA

final result: passed

## Reference and scope

User-selected reference: supplied Chrome screenshots of https://www.jameschugh.com/, supplemented by actual Chromium capture of the reference. This is an adaptation to Abhay's resume and repositories, with original artwork; it is not a claim of pixel-identical reproduction or James's personal content.

Source screenshots: `/workspace/scratch/reference/{hero,hero-theme,journey,work,contact,mobile}.png`.
Implementation: `http://terminal.local:4173/`, captured with installed Chromium via Playwright, with local proxy bypass and hostname mapping. User explicitly authorized Chrome inspection. Browser-rendered screenshots: `/workspace/scratch/valley-qa/{hero-night,hero-day,journey,journey-selected,work,project,toolkit,about,contact,guide,mobile-hero,mobile-journey,mobile-work,mobile-contact,mobile-guide}.png`.

Desktop viewport/CSS size/source pixels/implementation pixels: 1600×1000, deviceScaleFactor 1. Mobile: 390×844 at density 1. Browser chrome is excluded from both captured surfaces. Full comparisons normalize each side equally to 800px maximum width (mobile at 300px maximum width); no design judgments are based on the user's higher-density browser chrome.

## Comparison evidence

Opened and inspected combined source/implementation inputs:

- `/workspace/scratch/valley-qa/final-compare-hero.jpg`: both daylight, home, top of page. Scenic full-bleed composition, foreground engineer, top utility controls, editable headline and place labels, floating navigation.
- `/workspace/scratch/valley-qa/final-compare-journey.jpg`: charcoal journey/map, desktop. Heading, map, stop markers, detail card, timeline, persistent navigation.
- `/workspace/scratch/valley-qa/final-compare-work.jpg`: charcoal project section, desktop. Dimensional wooden box and physical project cards; Abhay's four projects use an adjacent accessible text index, retaining the reference's box metaphor.
- `/workspace/scratch/valley-qa/final-compare-mobile.jpg`: portrait home. The source has a partially clipped headline during its intro; Abhay's mobile title deliberately remains readable. Responsive crop retains the foreground engineer and dog.
- `/workspace/scratch/valley-qa/final-nav-compare.jpg`: focused full-density navigation crop. Similar floating rounded dock, active section treatment, compact section links, and resume action. Day/night palette differences are intentional; the supplied dark reference and default night mode use yellow CTA accents.

## Fidelity surfaces

- **Fonts/typography:** Bricolage Grotesque, the actual reference display family, is served locally in 400/700/800 weights. Measured source desktop sizes: hero 78.4px, journey 73.6px, work 56px at 1600px width. Adapted hero/journey use 4.9vw/4.6vw and work uses 56px. Line height and tracking were tightened after comparison. Abhay's words and resume replace the reference's identity and claims.
- **Spacing/layout:** Full-viewport scenic opening, scene push-in before narrative sections, centered journey heading, map occupying the principal region, card-box work, and persistent bottom dock. Mobile controls remain within viewport; long repository names wrap. The project index sits beside the box on desktop and below on mobile to preserve access to four detailed repository demos.
- **Colors/tokens:** Charcoal #1d1d1b, warm off-white type, muted neutral supporting text, and #ffdc6b yellow interaction accents. Day mode switches both illustration and UI tokens. No unrelated neon or studio/glass design system remains in active content.
- **Images:** Original generated matched day/night landscape, city-map and wooden-box WebP assets; retained original illustrated character and actual repository recording poster. Real Bootstrap Icons are served as image assets; no emoji, handmade SVG illustrations, or generic placeholder artwork. Original art deliberately differs in exact landmark architecture while matching the selected landscape composition and palette. This is a conceptual character, not an asserted photographic likeness.
- **Copy/content:** Education, roles, dates, locations, metrics and skills remain grounded in the supplied resume. No James Chugh employers, reviews, visitor counts, personal photography, badge claims, app results or contact details are copied. Repository videos/explainers preserve their disclosure of recorded versus illustrative behavior.

## Findings and iteration history

1. **P1 — Broken icon images in first browser capture.** Local Node server omitted SVG MIME type and used nosniff. All icons, including map markers and controls, failed to decode. Added SVG, WebP and TTF MIME mappings; reloaded in a fresh browser. Post-fix browser image audit reports no broken images, and updated journey screenshot shows proper map markers and control icons. Added HTTP MIME regression assertions.
2. **P2 — Mobile horizontal overflow from rotated project cards.** First browser check reported overflow. Scoped clipping to the work section and adjusted mobile card framing. Repeated 390×844 checks report no horizontal overflow; persistent dock and primary actions remain visible.
3. **P2 — Mobile landscape crop lost the foreground character.** Center crop showed only the valley. Shifted portrait crop to 8% horizontal position. Post-fix `mobile-hero.png` includes the engineer, laptop and dog.
4. **P2 — Oversized section typography and project box approximation.** Initial work heading used 88px and box front was a flat panel. Measured actual source styles, corrected heading sizes/line height, replaced panel with generated dimensional wooden-box raster, and compared `final-compare-work.jpg` after changes.
5. **P2 — Journey timeline too close to bottom navigation.** Lifted desktop timeline and removed global anchor padding that offset the sticky stage. Repeated mobile and desktop screenshots show independently usable timeline and navigation.

No actionable P0/P1/P2 finding remains in the reviewed states.

## Browser checks

Passed on desktop and mobile: main navigation and active section, day/night switch and persisted state, selected career-stop card, zoom/recenter, project recording dialog, interactive explainer steps, toolkit unpack and tool selection, guide open/question/local resume answer, and Escape dismissal. Actual hero scroll progression, journey scroll selection, audio controls, draggable notes, and map drag were additionally checked. Browser console/page-error list is empty. Image audit is empty. Horizontal overflow check is false at both widths. Reduced-motion home has a single viewport without forced animation.

Provider integration is unchanged from the verified resume-grounded Gateway backend; production API is checked again after deployment. Local browser runs use the labelled local resume fallback. No screenshot or build result is used as a substitute for a provider response.

## Follow-up polish

P3: The conceptual valley artwork and scenery differ from James's exact illustration. A bespoke rigged character animation remains a separate asset task; this version implements the reference's landscape/scroll interaction direction. The browser accessibility tree and focus were spot-checked, not a formal assistive-technology audit. Touch-only physical-device testing remains outside this Chromium pass.
