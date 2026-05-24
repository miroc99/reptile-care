# 設計交付：爬蟲環控系統 UI 重新設計 (Reptile Climate Control UI)

> A handoff bundle for **Claude Code (local CLI)**. Open this folder in your project, ask Claude Code to read this README first, then implement the screens in your real codebase.

---

## 1. Overview

A multi-tank reptile habitat monitoring & automation app for hobbyist keepers.
Goal: give the keeper a calm, glance-able view of all enclosures, plus deep control of schedules, devices (heat lamps, UVB, misters, fans), alerts, and system settings.

The bundle contains **two device targets** rendered in parallel:

| Target  | Resolution        | Files                                                                                          |
| ------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| Desktop | 1440 × 900 (web)  | `src/desktop*.jsx`                                                                             |
| Mobile  | 390 × 844 (iOS)   | `src/mobile*.jsx`                                                                              |

Both are wired to the same mock data (`src/data*.jsx`) and share atomic UI primitives (`src/atoms.jsx` + `src/styles.css`).

---

## 2. About these files

> **These files are design references, not production code.**

They are an HTML/JSX prototype rendered in a sandboxed browser preview. They use Babel-in-the-browser, a custom `<DesignCanvas>` shell, and an `<IOSDevice>` bezel — none of those should be carried over into your real app.

Your task is to **recreate these screens in the target codebase's existing environment** (React + Vite + Tailwind, Next.js, React Native, SwiftUI — whatever the real project is), using its established components, routing, and state management. If no environment exists yet, pick the most appropriate one and explain why.

Do **not**:
- Copy `index.html`, `design-canvas.jsx`, or `ios-frame.jsx` into the app.
- Ship the `<deck-stage>` / `<DCArtboard>` / `<IOSDevice>` wrappers.
- Use `<script type="text/babel">` loading.

Do:
- Lift the **design tokens** verbatim (Section 6).
- Re-implement every screen pixel-faithfully using your stack.
- Replace the mock data with real API/store wiring.

---

## 3. Fidelity

**High-fidelity.** Colors, type, spacing, radii, shadows, and interaction states are all final. Match them exactly. Animations (toggle, hover lift, dot pulse) are specified and should be reproduced.

The data is mock — feel free to rename fields or restructure the shape to fit your backend, but keep the **visible metrics, ranges, and copy** the same so the design intent survives.

---

## 4. Information architecture

Four top-level routes, reachable from a persistent left nav (desktop) or bottom tab bar (mobile):

1. **儀表板 Dashboard** (`/`) — overview of all tanks + drill-into per-tank detail page
2. **排程 Schedule** (`/schedule`) — global 24h timeline across all tanks + week density + upcoming queue
3. **告警 Alerts** (`/alerts`) — open alerts, history log, trigger time-of-day distribution, source-tank breakdown
4. **設定 Settings** (`/settings`) — relay channels, raw sensor data, system log, network & backup

Dashboard has a sub-route:
- **Tank detail** (`/tank/:id`) — back arrow top-left, full per-tank data (24h trend, devices, schedule, feeding, health)

---

## 5. Screens (8 total — 4 desktop + 4 mobile)

For each, see the corresponding `.jsx` file in `src/` for exact markup.

### 5.1 Dashboard / Tank detail
- Files: `src/desktop.jsx`, `src/desktop-detail.jsx`, `src/mobile.jsx`, `src/mobile-screens.jsx`
- **Desktop layout**: left nav rail (72px wide expanded to label-on-hover, or fixed 220px), main column with hero greeting, a row of KPI cards (active tanks, alerts open, devices on, next action), then a 3-column grid of **tank tiles**. Right rail shows recent activity + upcoming queue.
- **Tank tile**: glass card with avatar monogram, name + species, current temp/hum with target range bar, mini sparkline (24h), active-device chips. Hover lifts -2px and brightens border. Click → detail.
- **Tank detail**: back arrow + title, big current-conditions panel (temp + hum, each with target band overlay on the chart), device grid with on/off toggles + power %, schedule strip (24h), feeding card, health card.
- **Mobile dashboard**: condensed; vertical stack of tank cards with same anatomy at smaller scale; bottom tab bar with 4 icons.

### 5.2 Schedule
- Files: `src/desktop-schedule.jsx`, `src/mobile-screens.jsx`
- **Global 24h timeline** — one row per tank, colored segments per device (amber = heat, violet = UVB, sky = mister, sage = fan).
- **Week density** heatmap, 7 columns × 24 rows of small cells.
- **即將執行** "upcoming" list (next 5 actions across all tanks).
- Filter chips at top: by tank, by device type.

### 5.3 Alerts
- Files: `src/desktop-alerts.jsx`, `src/mobile-screens.jsx`
- **待處理** "Open" list at top — each row: severity dot (crimson/amber/sky), tank, timestamp, message, value badge, [處理] action.
- **歷史** "History" log — paginated list of resolved alerts.
- **觸發時段分佈** — 24-bin bar chart showing when alerts tend to fire.
- **來源飼養缸** — donut showing which tank generates the most alerts.

### 5.4 Settings
- Files: `src/desktop-settings.jsx`, `src/mobile-settings.jsx`
- **繼電器通道** — table of relay channels (CH1–CH8), what's plugged in, current state, manual override toggle.
- **感測器原始數據** — raw probe readings, calibration offsets, last-seen timestamps.
- **系統日誌** — terminal-style mono log feed.
- **網路與備份** — Wi-Fi SSID/IP, MQTT broker status, last-backup time, "立即備份" button.

---

## 6. Design tokens

Pull these straight from `src/styles.css`. Re-create them in your design system / Tailwind config / SwiftUI theme.

### 6.1 Surfaces (warm-toned dark)
```
--bg-0:        oklch(0.13 0.012 60)     /* base canvas */
--bg-1:        oklch(0.16 0.014 60)     /* raised surface */
--bg-2:        oklch(0.20 0.016 60)     /* highest surface */
--glass-bg:    rgba(255, 250, 245, 0.035)
--glass-bg-hi: rgba(255, 250, 245, 0.06)   /* hover */
--glass-border:    rgba(255, 255, 255, 0.08)
--glass-border-hi: rgba(255, 255, 255, 0.14)
```

App background uses two radial gradients on top of `--bg-0`:
```
radial-gradient(140% 90% at 88% -10%, oklch(0.26 0.06 50 / 0.55), transparent 55%),
radial-gradient(120% 80% at -10% 110%, oklch(0.22 0.05 200 / 0.35), transparent 60%),
oklch(0.13 0.012 60)
```

### 6.2 Ink / text
```
--ink-1: oklch(0.97 0.005 80)    /* primary */
--ink-2: oklch(0.78 0.012 75)    /* secondary */
--ink-3: oklch(0.58 0.014 70)    /* muted */
--ink-4: oklch(0.42 0.012 65)    /* dim / disabled */
```

### 6.3 Accents (semantic + decorative)
```
--amber:   oklch(0.80 0.13 65)    /* heat / primary CTA / active nav */
--sage:    oklch(0.78 0.10 155)   /* airflow / OK / sage tone */
--sky:     oklch(0.80 0.09 230)   /* humidity / mister */
--crimson: oklch(0.70 0.18 25)    /* critical alerts */
--violet:  oklch(0.74 0.10 305)   /* UVB / light */
```
Each accent has a `-dim` variant at lower lightness/chroma for inactive states. Pills/badges use `color-mix(in oklch, <accent> 8–10%, transparent)` for fill and `30–35%` for border.

### 6.4 Radii
```
--radius-s:  10px
--radius-m:  16px
--radius-l:  22px      /* default glass card */
--radius-xl: 28px
```

### 6.5 Typography
- **Display / numbers**: Space Grotesk 400/500/600/700, letter-spacing -0.02em
- **Body / Traditional Chinese**: Noto Sans TC 300/400/500/600/700
- **Mono / logs / timestamps**: JetBrains Mono 400/500, `font-variant-numeric: tabular-nums`
- Body font-size base 14px on both desktop and mobile.
- Labels (`.t-label`): 11px, uppercase, letter-spacing 0.14em, muted ink.
- KPI values (`.kpi-value`): tabular-nums, weight 500, letter-spacing -0.02em.

### 6.6 Effects
- **Glass card**: `backdrop-filter: blur(20px) saturate(140%)` + 1px top-highlight border drawn via a `::before` mask trick (see `.glass::before` in styles.css).
- **Shadow**: `0 60px 120px -40px rgba(0,0,0,0.55)` for elevated frames; `inset 0 0 0 1px rgba(255,255,255,0.06)` for inner ring.
- **Tank tile hover**: `transform: translateY(-2px)`, 220ms ease.
- **Toggle**: 44×26, knob 20×20, cubic-bezier(.5,1.6,.6,1) bounce in 220ms. On-state uses accent at 80% opacity with knob recolored to `#1a1410`.
- **Status dot pulse**: 1.6s ease-in-out infinite, opacity 1 → 0.35 → 1, plus `box-shadow: 0 0 8px currentColor` glow.

---

## 7. Component inventory

Re-implement each of these as a real component in your codebase. They are all in `src/atoms.jsx` (and used across screens).

| Component        | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `GlassCard`      | All container surfaces. `.glass` class. Variants: hover-enabled. |
| `Pill`           | Status badge, tones: sage / amber / crimson / sky / default.     |
| `Dot`            | 6px round status indicator, can `pulse`.                         |
| `Avatar`         | Monogram circle, tones match accents.                            |
| `Toggle`         | On/off switch with tone variants.                                |
| `IconBtn`        | 36×36 circular icon button.                                      |
| `NavItem`        | Left-rail nav row, active state uses amber tint.                 |
| `Tabs` + `Tab`   | Pill-group toggle, active uses amber 20%.                        |
| `RangeBar`       | Target-band bar with current-value marker.                       |
| `Sparkline`      | Inline SVG line chart, 24-point time-series.                     |
| `ScheduleStrip`  | 24h horizontal strip with colored device segments.               |
| `KpiCard`        | Label + big number + delta/trend.                                |

Icons: the prototype uses inline SVGs. Substitute with your icon library (Lucide, SF Symbols, etc.) keeping shape semantics: heat=flame, light=sun, humid=droplet, air=wind, alert=triangle, fan=fan.

---

## 8. Interactions & state

- **Routing**: Dashboard → Tank detail via card click. Back arrow returns. Top tabs (overview/schedule/alerts/settings) are global.
- **Toggle device**: optimistic flip; persist via your store; show subtle pulse on the corresponding device card border while writing.
- **Schedule edit**: out of scope for this round — current design is read-only timeline. Plan for tap-to-edit segment in v2.
- **Alert acknowledge**: tap [處理] → animate row out, move to history.
- **Hover states (desktop only)**: glass-bg lightens, border brightens, tank tile lifts. Skip on touch.
- **Empty states**: not designed yet — ask the user before inventing them.

---

## 9. Mock data

See `src/data.jsx`, `src/data-more.jsx`, `src/data-settings.jsx`. Three tanks ship in the demo:

| ID         | Name (zh)  | Species              | Targets                  | State                              |
| ---------- | ---------- | -------------------- | ------------------------ | ---------------------------------- |
| `shimaki`  | 島輝的家    | Hemitheconyx caudicinctus (肥尾守宮) | T 28–32°C / H 55–70% | Healthy                            |
| `douzhai`  | 斗宅的家    | Heterodon nasicus (西方豬鼻蛇)       | T 26–30°C / H 40–55% | Healthy, feeding due today         |
| `shimaz`   | 島Z的家     | Eublepharis macularius (豹紋守宮)    | T 27–31°C / H 40–50% | **2 alerts** — high temp + low hum |

Each tank carries: `current`, `target`, `trend24h` (24 hourly samples), `devices[]`, `alerts[]`, `schedule[]`, `feeding`, `health`. Use this shape as your initial TypeScript type, then refine to match your API.

---

## 10. Locale & copy

UI copy is **Traditional Chinese (zh-Hant)**. Numbers and timestamps stay Western (24h time, °C, %). Don't translate to Simplified or English without asking. Tank names are user-named — your real app must let users rename them.

---

## 11. Files in this bundle

```
design_handoff_reptile_care/
├── README.md                    ← you are here
├── index.html                   ← prototype shell (reference only — do NOT port)
├── design-canvas.jsx            ← preview-only canvas wrapper (do NOT port)
├── ios-frame.jsx                ← preview-only iPhone bezel (do NOT port)
├── screenshots/                 ← reference PNGs of every screen
│   ├── 01-desktop-dashboard.png
│   ├── 02-desktop-tank-detail.png
│   ├── 03-desktop-schedule.png
│   ├── 04-desktop-alerts.png
│   ├── 05-desktop-settings.png
│   ├── 06-mobile-dashboard.png
│   ├── 07-mobile-tank-detail.png
│   ├── 08-mobile-schedule.png
│   ├── 09-mobile-alerts.png
│   └── 10-mobile-settings.png
└── src/
    ├── styles.css               ← LIFT TOKENS FROM HERE
    ├── atoms.jsx                ← component primitives
    ├── data.jsx                 ← mock tank data
    ├── data-more.jsx            ← activity + upcoming + schedule
    ├── data-settings.jsx        ← relays + sensors + logs
    ├── desktop.jsx              ← dashboard
    ├── desktop-detail.jsx       ← tank detail page
    ├── desktop-schedule.jsx     ← schedule view
    ├── desktop-alerts.jsx       ← alerts center
    ├── desktop-settings.jsx     ← system settings
    ├── mobile.jsx               ← mobile shell + dashboard
    ├── mobile-screens.jsx       ← mobile schedule + alerts + detail
    └── mobile-settings.jsx      ← mobile settings
```

**Cross-reference the screenshots with the section in §5 as you implement each screen.** The JSX is the source of truth for layout; the PNGs are the visual target.

To preview the original prototype: open `index.html` in a browser (needs internet for the React/Babel CDNs).

---

## 12. Suggested implementation order

1. Set up the design tokens (CSS vars / Tailwind config / theme file) from §6.
2. Build the atomic primitives in §7 with a Storybook story each.
3. Implement Dashboard + Tank tile + Tank detail (the two highest-traffic screens).
4. Implement Schedule.
5. Implement Alerts.
6. Implement Settings.
7. Wire to real data.
8. Add motion (toggle bounce, dot pulse, hover lift) last.

Ask the user before adding any screens, copy, or features not described above.
