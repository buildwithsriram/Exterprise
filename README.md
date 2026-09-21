# Exterprise — editable source

This export matches the published website at source revision
`7ae50f51431100be4d5039c2f3202dfaf038d52c`.

## Host without building

Upload all contents of `dist/` to a static web host, or use the identical
prebuilt `website/` folder beside this source folder. No runtime or API keys
are required. Keep index.html at the host's document root.

## Edit in Cursor or VS Code

Open this source folder. For the development server use Node.js 20.19+
(or 22.12+) and run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For a preview without Node:

```sh
python3 -m http.server 8080 --directory dist
```

After changing templates or source copy, regenerate HTML using Python 3:

```sh
python3 scripts/build.py
```

`npm run build` runs the same compiler. On Windows, `py -3 scripts/build.py`
can be used instead. The compiler uses Python's standard library.

## Where to edit

| Path | Purpose |
| --- | --- |
| scripts/home_sections.py | Hero, brand story, shared UtterNow YouTube embed |
| scripts/build.py | Shared navigation, page templates and compiler |
| scripts/visual_sections.py | Service icons and visual treatments |
| source-copy/ | Supplied HTML copy and authorized corporate/product excerpts |
| dist/scene-refinements.css | Latest trust, type, video and transition refinements |
| dist/brand-refresh.css | Brand styling, hero and service gallery |
| dist/styles.css, dist/refinement.css | Shared/base styling |
| dist/reference-motion.js | Horizontal text, paragraph reveal, gallery and video scroll motion |
| dist/hero-motion.js | Flowing-line hero animation |
| dist/app.js | Navigation, themes, counters and shared interactions |
| dist/refinement.js, dist/brand-refresh.js | Other retained motion behaviors |
| dist/assets/ | Bundled logo, badges and imagery |
| ASSETS.md | Media provenance and replacement history |
| content-audit.json | Content preservation audit |

**Do not delete dist/**: it contains authored CSS, JavaScript and media as
well as generated HTML. CSS/JS edits are immediate; direct generated HTML
edits are overwritten by the next compiler run. After editing, republish
the contents of source/dist. The sibling website folder is an export snapshot
and does not update automatically.

The UtterNow video ID is `oObUCT76Zj4`; change it in scripts/home_sections.py
and rebuild to replace the video everywhere it appears. Native YouTube
controls provide playback and fullscreen. The scroll layout adapts on mobile
and honors reduced-motion settings.

## Pages

Corporate home (index.html), ServiceNow hub (servicenow.html), AI Agents &
Now Assist, ServiceNow Otto, Customer Service Management, Field Service
Management, IT Service Management, IT Operations Management, HR Service
Delivery, Strategic Portfolio Management, and Now Platform.

Some broader corporate links intentionally point to exterprise.us. Contact
links use the existing contact page and mailto; this static site has no form
backend. YouTube and Google Fonts are external services. All gallery images
and brand assets needed by the design are included locally.

This export excludes installed dependencies, Git history, and account-specific
hosting configuration. It is ready to place in a new Git repository.
