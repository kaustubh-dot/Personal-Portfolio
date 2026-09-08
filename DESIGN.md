> Current root-page layout: [Project-first refactor](docs/PROJECT_FIRST_REFACTOR.md). The current layout restores the comic foreground and keeps the procedural background fully visible; the notes below document the original visual language and motion world.

---
name: Kaustubh Portfolio
description: A kinetic comic-print portfolio for an AI systems builder, staged as a persistent web-slinging city.
colors:
  newsprint-paper: "#FBFAF5"
  secondary-stock: "#F2EFE6"
  inking-black: "#15151C"
  caption-graphite: "#4A4A58"
  action-red: "#E0202F"
  registration-red: "#B30E1E"
  system-blue: "#2342D6"
  extrusion-blue: "#16289B"
  signal-yellow: "#FFC400"
  faint-ink-rule: "rgba(21, 21, 28, 0.16)"
  pure-white: "#FFFFFF"
typography:
  display:
    fontFamily: "Bangers, cursive"
    fontSize: "clamp(60px, 12vw, 180px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.015em"
  section-heading:
    fontFamily: "Bangers, cursive"
    fontSize: "clamp(40px, 6vw, 80px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "0.01em"
  body:
    fontFamily: "Patrick Hand, cursive"
    fontSize: "clamp(17px, 1.35vw, 20px)"
    fontWeight: 400
    lineHeight: 1.38
    letterSpacing: "0.01em"
  ui:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0"
  utility:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.22em"
rounded:
  none: "0"
  ink-chip: "5px"
  control: "14px"
  social: "16px"
  panel: "18px"
  card: "20px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "18px"
  lg: "28px"
  xl: "44px"
  xxl: "70px"
  page-gutter: "clamp(20px, 6vw, 96px)"
  chapter-block: "clamp(90px, 14vh, 160px)"
components:
  button-primary:
    backgroundColor: "{colors.action-red}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.control}"
    padding: "14px 32px"
    typography: "{typography.display}"
  button-secondary:
    backgroundColor: "{colors.newsprint-paper}"
    textColor: "{colors.inking-black}"
    rounded: "{rounded.control}"
    padding: "14px 32px"
    typography: "{typography.display}"
  speech-panel:
    backgroundColor: "rgba(251, 250, 245, 0.9)"
    textColor: "{colors.inking-black}"
    rounded: "{rounded.panel}"
    padding: "18px 22px"
    typography: "{typography.body}"
  comic-card:
    backgroundColor: "{colors.newsprint-paper}"
    textColor: "{colors.inking-black}"
    rounded: "{rounded.card}"
    padding: "30px"
    typography: "{typography.body}"
  system-chip:
    backgroundColor: "{colors.secondary-stock}"
    textColor: "{colors.inking-black}"
    rounded: "{rounded.ink-chip}"
    padding: "6px 10px"
    typography: "{typography.utility}"
  social-tile:
    backgroundColor: "{colors.newsprint-paper}"
    textColor: "{colors.inking-black}"
    rounded: "{rounded.social}"
    padding: "15px 22px"
    typography: "{typography.display}"
---

## Overview

**Creative North Star: "The Web-Slung Build Lab"**

The page should feel like a hand-inked engineering field report taking place inside one continuous superhero city. The interface is printed matter in the foreground; the persistent procedural skyline, rooftop figure, moon, and web are the living world behind it. Every layer communicates the same premise: Kaustubh builds serious AI systems with the energy, decisiveness, and physicality of a comic-book action sequence.

The mood is kinetic, handmade, technically playful, high-contrast, and purposeful. It is not a generic superhero skin. The narrative metaphor is tied to product work: building, firing, tracing, measuring, and shipping. New features should strengthen that metaphor or remain neutral enough to let it lead.

The implementation uses a Marquee Hero with a custom illustrated centerpiece, then changes into an editorial chapter sequence. A fixed spatial diagram runs behind the entire document. The hero is intentionally louder than the rest of the page; later chapters preserve the inked material system while giving content more room to breathe.

**Key Characteristics:**

- Warm newsprint surfaces with visible halftone registration.
- Heavy comic display type contrasted with terse system metadata and handwritten explanatory copy.
- Hard ink outlines, offset print shadows, shallow rotations, and flat color fields.
- A persistent procedural world rather than decorative stock imagery.
- Physical motion: recoil, elasticity, parallax, tilt, reveal, and scroll-driven traversal.
- One dominant superhero/web metaphor repeated through copy, scene, progress, cursor, and micro-interactions.

## Colors

The palette is a five-ink print system supported by one muted stock and one caption tone. Newsprint Paper is the default surface. Inking Black carries nearly every outline and structural edge. Action Red is the primary action color, System Blue is the secondary extrusion/system color, and Signal Yellow is reserved for sparks, highlights, and small moments of emphasis.

| Token | Value | Role |
| --- | --- | --- |
| Newsprint Paper | `#FBFAF5` | Page, cards, buttons, foreground print surface |
| Secondary Stock | `#F2EFE6` | Chips and subtle surface separation |
| Inking Black | `#15151C` | Text, outlines, skyline, hard shadows |
| Caption Graphite | `#4A4A58` | Secondary metadata and HUD copy |
| Action Red | `#E0202F` | Primary action, web thread, progress, accents |
| Registration Red | `#B30E1E` | Darker red type and extrusion detail |
| System Blue | `#2342D6` | Secondary accent, technical contrast |
| Extrusion Blue | `#16289B` | Deep type extrusion and shadow |
| Signal Yellow | `#FFC400` | Stars, bursts, selection, small highlights |
| Faint Ink Rule | `rgba(21, 21, 28, 0.16)` | Quiet dividers and secondary structure |
| Pure White | `#FFFFFF` | Hover lift and high-contrast button copy only |

**The Five-Ink Rule.** Treat Newsprint Paper, Inking Black, Action Red, System Blue, and Signal Yellow as the visible ink set. Do not add a new feature color for each concept. Deep variants may create extrusion or improve contrast; they are not additional semantic categories.

Color is flat and printed. Gradients are limited to generated halftone masks, striped loading/progress fills, and faithful third-party brand marks. Do not introduce ambient UI gradients, neon glows, or glass-like chromatic haze.

## Typography

Typography is role-based, not chosen per component.

- **Bangers** is the action voice: hero lines, section headlines, cards, numerals, CTAs, and comic labels. It stays uppercase, short, and wide. It should not carry paragraphs.
- **JetBrains Mono** is the system voice: navigation, eyebrows, badges, chips, HUD values, and operational metadata. Use uppercase with generous tracking.
- **Patrick Hand** is the current explanatory voice: speech panels, card summaries, focus descriptions, and longer human copy. It creates the hand-annotated field-report feeling.
- **Archivo** is the neutral interface fallback: base text, utility content, and any dense information that becomes harder to scan in the handwritten face.

**The Role Contrast Rule.** Every composition should contain at most one action voice, one system voice, and one explanatory voice. A feature should not use Bangers for both its heading and its body, nor use JetBrains Mono for long prose. Keep hero and section display lines to one or two broad lines where possible; the current hero is the intentional three-line exception.

Use sentence case for long body copy even when adjacent headings are uppercase. Avoid artificial all-caps emphasis inside prose. Use weight, color, or a short Bangers phrase instead.

## Layout

The page is a foreground editorial document laid over a fixed spatial world.

1. A full-viewport hero establishes voice, setting, and primary action.
2. Two opposed diagonal marquees form a hard transition from identity to evidence.
3. Four numbered chapters follow: build style, featured builds, current focus, and contact.
4. Each chapter uses one dominant layout primitive: split editorial grid, three-card case file, stacked focus rows, then centered conversion block.
5. A single-line footer closes the field report.

Page gutters use `clamp(20px, 6vw, 96px)`. Standard chapter padding uses `clamp(90px, 14vh, 160px)`. The content width is capped at `1400px`. The hero is the only section that deliberately occupies `100svh`; new sections should not compete with it by default.

**The Persistent World Rule.** The background is not reset per section. The Three.js canvas stays fixed at the back of the page while the foreground document scrolls over it. New chapters may react to the world, but they must not introduce a second independent cinematic background.

**The Major-Chapter Rule.** The numbered eyebrow pattern belongs to top-level chapters only. Do not add an eyebrow above every nested card, subsection, or control group. Inside a chapter, use badges, chips, or plain headings.

### Responsive behavior

- Navigation links disappear below `760px`; the wordmark and GitHub action remain.
- The HUD disappears below `860px`.
- The about split collapses below `900px`.
- Project cards collapse below `980px`.
- Focus rows collapse below `760px`.
- The social grid becomes one column below `460px`.
- Fine-pointer cursor effects and the 2D trail disappear whenever hover is unavailable.

At small widths, preserve hierarchy before spectacle: allow headings to scale down, stack grids, keep tap targets full-sized, and prevent the persistent world from obscuring copy. Do not shrink multi-column content until it becomes technically present but practically unreadable.

## Elevation & Depth

Depth looks printed and mechanical rather than photographic.

- Default buttons and social tiles use a `5px 5px 0` hard ink shadow.
- Speech panels use a quieter `6px 6px 0 rgba(21, 21, 28, 0.18)` shadow so prose remains readable over the city.
- Project cards use `8px 8px 0` and can lift to `14px 14px 0` on hover.
- Borders are usually `3px solid` Inking Black.
- Display depth is created with offset red/blue text shadows and `translateZ`, not soft blur.
- Rotations stay shallow, normally within one degree for resting surfaces.

The visual layer order is fixed: transparent WebGL canvas, halftone overlays, foreground DOM, HUD/navigation/progress, loader and click effects, then custom cursor. Respect this order when adding portals, drawers, or overlays.

Motion communicates physical cause. Entrances favor `power3.out`, `power4.out`, and `back.out`. Returns from magnetic or tilt states favor `elastic.out`. Continuous movement is limited to the persistent world, marquees, and small idle breathing. A new component gets one entrance response and one interaction response before it earns a continuous loop.

## Shapes

The shape language combines rigid ink construction with a few friendly rounded corners.

- Cards and stacked rows use `18px` to `20px` radii with `3px` ink borders.
- Buttons use `14px` radii; chips use `5px`; progress and small indicators may use full pills.
- Halftones are small regular dots, not noisy grain.
- Comic bursts use angular star polygons; webs use thin curved tubes and radial splats.
- Icons should be custom inline SVG, simple geometric marks, or restrained monochrome symbols. Do not use mismatched emoji as final production iconography for new features.

Corners should not all share one universal radius. The hierarchy is deliberate: chips are clipped and utilitarian, controls are compact, panels are softer, and cards carry the largest radius.

## Components

### Fixed navigation

Use a translucent newsprint strip with the wordmark at the left, a short system-link row in the center, and one red action at the right. It remains structurally quiet so the hero retains dominance. On mobile, hide the center links rather than compressing them into tiny targets.

### Hero statement

Use one system tag, a three-dimensional Bangers statement, one handwritten explanation panel, and one primary action. Keep the procedural rooftop figure and moon readable through the negative space around the statement. Do not add metric cards, secondary navigation, or a dashboard preview to the fold.

### Diagonal marquees

Use paired, opposed tracks as a scene cut. The black track carries capabilities with yellow separators; the red track carries a compact operating rhythm. Duplicate content exactly enough to loop without a visible seam.

### Chapter heading

Use one numbered JetBrains Mono eyebrow followed by one large Bangers statement. Accent one phrase in red or blue. The chapter heading announces a real change in information mode.

### Speech panel

Use translucent Newsprint Paper, a strong ink border, handwritten copy, and a muted hard shadow. It is for concise explanation over the fixed scene, not for every paragraph on the page.

### Project case file

Use a badge, a custom mark, one title, a concise explanatory paragraph, and a small chip row. The whole surface may tilt on fine pointers, but focus and touch states must remain stable. When project detail exists, turn the entire card into one semantic link or provide one clearly named action.

### Focus row

Use a large extruded sequence number, a compact action heading, and one explanatory paragraph. Alternate the resting rotation lightly, then square the row on hover. On mobile, stack in that order.

### Contact conversion block

Center one large invitation, one primary contact action, one secondary document action, and a small social grid. Keep network destinations secondary to the main contact path.

## Do's and Don'ts

### Do

- Strengthen the single web-slinging build-lab metaphor or remain visually neutral beneath it.
- Reuse the exact paper, ink, red, blue, and yellow palette before inventing new color.
- Build distinctive scene elements procedurally, in CSS, or with custom inline SVG.
- Keep display copy short, specific, and broad enough to exploit the Bangers silhouette.
- Reserve numbered eyebrows for major chapters and system labels for real metadata.
- Use hard outlines, offset shadows, small rotations, and physical easing consistently.
- Recalculate the global scroll choreography whenever document height changes materially.
- Provide keyboard focus, coarse-pointer behavior, and a true reduced-motion state for every new interaction.
- Treat text legibility as the foreground priority when the procedural world becomes visually busy.

### Don't

- Add a second theme, mascot, cinematic background, or unrelated motion metaphor.
- Introduce generic glass cards, soft ambient shadows, neon glows, or decorative gradients.
- Turn every sentence into uppercase Bangers or every label into widely tracked monospace.
- Add nested cards, dashboard-like metric islands, or bento grids without a content reason.
- Add bounce or elastic easing to ordinary state changes such as validation, filtering, or navigation.
- Add continuous animation simply because a component can move.
- Attach scroll behavior to assumed pixel positions without testing the entire page journey.
- Hide required content behind hover-only states.
- Use emoji as the permanent visual system for new project categories.
- ship a feature that works only with a mouse, full motion, WebGL, or third-party CDN availability.
