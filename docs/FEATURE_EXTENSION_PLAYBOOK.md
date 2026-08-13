# Feature Extension Playbook

## Goal

Use this playbook whenever a new portfolio feature is proposed. It converts the original Fable design intelligence into a repeatable implementation process while preventing surface-level imitation and inherited technical debt.

Read these sources first:

1. [../DESIGN.md](../DESIGN.md) for the canonical visual and component system.
2. [FABLE_REVERSE_ENGINEERING.md](FABLE_REVERSE_ENGINEERING.md) for provenance, thought process, UI/UX logic, and known debt.
3. [MOTION_BACKGROUND_ENGINE.md](MOTION_BACKGROUND_ENGINE.md) before touching scroll, Three.js, GSAP, cursor, or scene layers.

## The continuation principle

> Extend the metaphor and material system, not the exact section template.

A strong addition should do three things:

1. Advance a real visitor decision or complete a useful action.
2. Belong to the Web-Slung Build Lab through form, copy, interaction, or spatial behavior.
3. Introduce no more motion and rendering cost than its narrative role earns.

Do not begin by choosing an animation or copying a card. Begin with the feature’s job in the portfolio story.

## 1. Classify the feature

### Class A: Content enrichment

Examples:

- A verified achievement or credential.
- A richer project summary.
- A short experience or education entry.
- A publication or technical note.

Default approach:

- Stay in semantic DOM.
- Reuse an existing material family.
- Choose a new information composition rather than another equal card row.
- Use the standard reveal only if it helps reading order.
- Recalculate global scroll pacing after content height changes.

### Class B: Actionable project evidence

Examples:

- Repository and live-demo destinations.
- A detailed case-study route.
- Evaluation results and evidence.
- Architecture or outcome details.

Default approach:

- Make the action semantic and keyboard reachable.
- Treat the project case file as a link or provide one explicit action.
- Use Archivo for sustained reading.
- Preserve case-file language and system metadata.
- Prefer a dedicated route for long content instead of a nested card or oversized modal.

This is currently the highest-value feature class because the existing project cards imply interactivity but have no destinations.

### Class C: Interactive foreground tool

Examples:

- A model evaluation explorer.
- An attack-path demonstration.
- A scoring explanation simulator.
- A trace or agent workflow viewer.

Default approach:

- Build one focused instrument panel, not a dashboard of unrelated widgets.
- Use the established paper/ink material and exact type roles.
- Keep form state and data comprehension calm; reserve comic physics for entry, success, or a meaningful physical action.
- Define loading, empty, error, success, and disabled states.
- Pause or subdue the background while concentrated interaction is required.
- Use a separate route when the tool exceeds one viewport or needs persistent state.

### Class D: Persistent-world event

Examples:

- A new checkpoint tied to a major chapter.
- A web branch leading to one new scene object.
- A mission marker that responds to verified project evidence.
- A new camera beat that changes narrative focus.

Default approach:

- Read the motion engine completely.
- Keep one shared world and one state spine.
- Add no second mascot or unrelated travel system.
- Use procedural primitives and exact scene colors.
- Establish transform ownership and object disposal.
- Re-author scroll pacing rather than appending geometry to an assumed percentage.

Class D should be rare. A feature does not deserve WebGL solely because the site already uses Three.js.

### Class E: Global infrastructure or navigation

Examples:

- Mobile chapter navigation.
- No-JavaScript fallback.
- Accessible overlay architecture.
- Shared token pipeline.
- Reduced-motion and lifecycle correction.

Default approach:

- Preserve the visible identity while improving system contracts.
- Treat accessibility and fallback as part of the feature, not a later patch.
- Avoid a framework migration unless the feature set genuinely needs routing, state, or content tooling that the static architecture cannot support cleanly.

## 2. Place it in the visitor story

Current sequence:

```text
Identity → vocabulary → philosophy → project evidence → technical direction → contact
```

Use this placement matrix:

| Feature purpose | Best position | Reason |
| --- | --- | --- |
| Verified proof, outcomes, testimonials | Immediately after Featured Builds | Strengthens evidence before technical direction |
| Detailed project content | Dedicated project route from a case file | Preserves homepage pace and creates a real destination |
| Experience or education | After Build Style or after proof | Adds context without interrupting identity |
| Technical writing or lab notes | After Current Focus or on a dedicated route | Continues curiosity and depth |
| Interactive demo | Linked from the relevant project or dedicated route | Keeps the homepage narrative readable |
| Availability/status | Near Contact, not in hero | Supports action without competing with identity |
| Mobile navigation | Global fixed layer | Restores chapter access across the whole journey |

Do not append a section simply because the footer is convenient. Its location must answer the next likely visitor question.

## 3. Choose a composition

The existing page already uses:

- Full-viewport statement.
- Opposed marquee transition.
- Editorial split.
- Three-up case-file grid.
- Indexed stacked rows.
- Centered conversion block.

Prefer a different structure for new information:

### Evidence rail

Use for two to five verified outcomes. Arrange one strong result with supporting sources in a horizontal or vertical rail. Give every claim a real destination. Avoid animated counters without evidence.

### Editorial case-study spread

Use a wide title, one diagram or screenshot, a short problem/decision/result sequence, and technical metadata. Alternate the visual side between projects only when the content benefits from it.

### Mission map

Use for a real sequence or dependency graph. Connect nodes with one custom line language that echoes web strands without becoming a decorative full-screen web.

### Lab instrument

Use for a simulator or technical demo. Provide one primary variable group, one result surface, and one explanation area. Do not nest panels inside dashboard cards.

### Proof stamps

Use for compact credentials or externally verified milestones. Build custom SVG or CSS stamps with ink misregistration and direct source links. Keep the count small.

### Field-note index

Use for articles or experiments. A typographic list with date, topic, and one short premise will vary the page more effectively than another card grid.

## 4. Apply the visual system

### Color assignment

Use semantic roles consistently:

- **Action Red:** the one primary action or most important event.
- **System Blue:** technical metadata, structural accents, and secondary emphasis.
- **Signal Yellow:** one small delight, active marker, or highlight.
- **Inking Black:** structure, copy, outline, and shadow.
- **Newsprint Paper:** readable foreground surface.

Do not assign red, blue, and yellow evenly merely to make a component colorful.

### Type assignment

- Use Bangers for a short action heading or decisive label.
- Use JetBrains Mono for source, date, technology, status, and telemetry.
- Use Patrick Hand for a short personal explanation or annotation.
- Use Archivo for case-study paragraphs, form instructions, data, tables, and sustained reading.

If a feature has more than three short paragraphs, it probably needs Archivo for its primary reading voice.

### Surface construction

Start from:

```text
border: 3px solid #15151C
background: #FBFAF5
shadow: 5–9px hard offset #15151C
resting rotation: within ±1° when appropriate
radius: 14px control, 16–20px panel/card, 5px chip
```

Then vary layout, scale, and one signature mark. Do not vary the base material without a narrative reason.

### Icon and illustration contract

Use, in order of preference:

1. Custom inline SVG.
2. CSS geometry.
3. Procedural canvas or Three.js primitives when interaction requires it.
4. A restrained monochrome icon from one consistent set.

Do not add platform-dependent emoji as permanent project imagery. Do not mix several icon families.

## 5. Design the feature state model

Every interactive feature must define all relevant states before visual polish:

| State | Required question |
| --- | --- |
| Default | Is purpose clear without hover? |
| Hover | What changes for fine pointers without hiding information? |
| Focus-visible | Can keyboard users locate and understand the target? |
| Active/pressed | Is the physical response immediate and restrained? |
| Visited | Should external evidence or articles communicate prior use? |
| Loading | Is progress real, named, and cancellable when necessary? |
| Empty | Does the surface explain why no result exists and what to do? |
| Error | Is recovery explicit and non-punitive? |
| Success | Is completion clear without relying on animation alone? |
| Disabled | Is the reason perceptible and is the state truly non-interactive? |

The current simulated loader is a thematic device, not a model for product loading state. New functional loading indicators must reflect real state.

## 6. Add motion with a cause

### Motion budget

By default, one new component receives:

- One standard entrance.
- One interaction response.
- No continuous loop.

A continuous loop is allowed only when it is part of the persistent environment or communicates active system state.

### Choose the easing by meaning

| Event | Easing direction |
| --- | --- |
| Content becomes readable | `power3.out` or `power4.out` |
| Comic object snaps into place | `back.out` |
| Physical object releases tension | `elastic.out` |
| Ambient breathing | slow sine |
| Mechanical tape or scanning | linear |
| Pointer/world following | time-normalized damping |

Do not use back or elastic easing for validation, navigation, filter changes, or dense data updates.

### Transform ownership

Use wrappers or CSS variables so one behavior owns one channel:

```text
outer wrapper: entrance opacity/translation
middle wrapper: scroll offset or layout motion
inner surface: pointer tilt
content layer: local z-depth
```

Do not let reveal, scrub, hover, and magnetic motion all write the same `transform` on one node.

### Reduced-motion contract

For every motion path, define a stable alternative:

- Content appears immediately.
- No continuous loop remains active.
- Spatial state is understandable from one frame.
- Feedback uses color, outline, copy, or immediate state change.
- Smooth scrolling is disabled.
- Hidden RAF/ticker work is not created.

## 7. Recalibrate the global scroll journey

### Why calibration is mandatory

The central state is:

```text
progress = scrollTop / (scrollHeight - clientHeight)
```

Adding content increases `scrollHeight`. It therefore:

- Slows the web’s visible progression per pixel.
- Changes which section is on screen at each checkpoint.
- Changes camera position and look target during every existing chapter.
- Changes the meaning of HUD percentages.
- Produces different timing at different responsive heights.

### Calibration workflow

1. Record the current normalized progress at the visual center of every major chapter on desktop and mobile.
2. Add the feature with final copy and realistic content dimensions rather than temporary filler height.
3. Record the same anchors again.
4. Observe all web checkpoints at `22%`, `45%`, `68%`, and `90%`.
5. Decide whether the central journey should remain global or become semantically keyed.
6. Adjust checkpoints, curve pacing, or section mapping intentionally.
7. Re-test backward scroll and hysteresis.

To estimate a section-center progress target:

```text
anchorProgress =
  (sectionTop + sectionHeight / 2 - viewportHeight / 2)
  / (documentHeight - viewportHeight)
```

Clamp the result to `0–1`.

### When to keep global progress

Keep it when:

- The page remains a single linear narrative.
- Added content is short.
- The web should always end with document completion.
- Checkpoint-to-section alignment does not need exact semantics.

### When to introduce semantic mapping

Consider a piecewise progress map when:

- A new chapter is much taller than the others.
- A long interactive area should not consume most of the camera journey.
- Checkpoints must correspond to named narrative events.
- Dedicated routes or expandable content change height dynamically.

A piecewise map can interpolate between measured chapter anchors while preserving one `0–1` world state. Do not introduce several independent scroll timelines that compete for the camera.

## 8. Protect the layer hierarchy

Use this placement guide:

| Feature | Layer |
| --- | --- |
| New skyline/scene object | WebGL world, z 0 |
| Print texture | Halftone registration, z 1 |
| Section content | Foreground document, z 2 |
| Small telemetry | HUD range, below navigation |
| Global fixed control | Navigation/progress range |
| Modal or drawer | Above navigation, below temporary cursor effects |
| Temporary comic feedback | Impact range |
| Pointer-only enhancement | Cursor range |

An overlay must use an opaque or nearly opaque paper surface, trap focus, restore focus on close, disable background interaction, and define what happens to the WebGL loop while open.

Do not solve stacking problems by inventing another arbitrary five-digit z-index.

## 9. Accessibility and resilience gate

No feature is complete until all applicable items pass.

### Keyboard and semantics

- Interactive surfaces use native semantic elements.
- Focus order follows visual and reading order.
- Every target has an authored `:focus-visible` state.
- No information or action requires hover.
- Heading levels remain sequential.
- Escape closes dismissible overlays.
- Focus is trapped inside modal UI and restored afterward.

### Pointer and touch

- Tap targets are at least comfortably touch-sized.
- Fine-pointer tilt/magnetism is gated away from coarse pointers.
- Scroll gestures never trigger press effects.
- Non-primary mouse buttons do not fire decorative shots.
- A visible default state communicates clickability before hover.

### Motion

- Reduced motion removes loops and large transforms.
- Preference changes after load are handled if the feature stays mounted.
- No content begins permanently invisible when JS fails.
- Animation is never the only success, error, or selection signal.

### Fallback and failure

- Core copy and destinations remain available without WebGL.
- Important content remains visible if GSAP or ScrollTrigger fails.
- A failed CDN cannot leave a permanent blocking loader.
- Loading indicators represent real state.
- External destinations use universal schemes or clear fallbacks.

### Content

- Project and achievement claims link to evidence when possible.
- Link names describe the destination.
- Long technical copy uses the neutral reading face.
- Dates, numbers, and technology labels remain understandable outside visual color coding.

## 10. Responsive test matrix

Test final content, not shortened samples.

| Width/condition | What to verify |
| --- | --- |
| `320px` | No clipped type/actions, full touch targets, no masked focus, single-column logic |
| `375px` | Hero balance, speech-panel length, project action clarity, mobile chapter access |
| `414px` | Social/action width, long chips, scene-to-copy contrast |
| `768px` | Navigation transition, row stacking, intermediate layout quality |
| `1024px` | Project grid behavior and scene framing at tablet landscape |
| `1440×900` | Intended hero composition, full navigation, cursor physics, checkpoint timing |
| `200% zoom` | No lost actions, clipped focus, or inaccessible fixed UI |
| Coarse pointer | No hover dependency, no accidental shots, stable panels |
| Keyboard only | Full navigation, actions, overlays, and visible focus |
| Reduced motion | Stable content, no hidden loops, no smooth scroll |
| No JavaScript | Core identity, projects, and contact remain readable |
| CDN failure | No permanent loader; semantic content remains available |
| Restored mid-page scroll | Web/camera state initializes to correct progress |

## 11. Performance gate

Before and after any Class C or D feature, measure:

- WebGL draw calls.
- Frame time on desktop and a real mobile device.
- DPR and canvas pixel dimensions.
- Number of active RAF, GSAP, interval, and observer loops.
- Detached or undisposed geometries, materials, textures, and DOM nodes.
- Work performed while the document is hidden.
- Pointer-event tween creation rate.
- Layout reads followed by transform writes.

Prefer these optimizations before reducing visual identity:

1. Pause hidden/offscreen work.
2. Dispose temporary objects completely.
3. Normalize damping with `dt`.
4. Gate fine-pointer effects.
5. Merge static scene geometry.
6. Adapt DPR and optional detail to device conditions.
7. Seed randomness for deterministic testing while preserving visual variation in production.

## 12. Suggested feature directions

These directions extend the existing site rather than compete with it.

### Actionable case files

Turn each current project surface into a real destination. A dedicated case-study page can use:

- One Bangers problem statement.
- Mono case metadata.
- An Archivo problem/decision/result narrative.
- One custom architecture diagram in the ink system.
- Verified result evidence.
- Red repository/demo action and a paper return action.

Signature interaction: a restrained “open case file” page transition or one unfolding evidence panel. No new full-screen cinematic background is required.

### Evaluation lab

Build one focused interactive demo tied to Agentic Systems. Treat it as a lab instrument:

- Input or scenario on paper.
- One trace/result surface.
- Blue system metadata.
- Yellow uncertainty or active marker.
- Red reserved for the primary run action or critical failure.

Signature interaction: a web checkpoint marks each real evaluation stage. Keep data transitions calm and readable.

### Verified proof rail

Add sourced outcomes after Featured Builds:

- One dominant result.
- Two to four supporting claims.
- Direct repository, demo, award, or publication links.
- Custom stamp marks instead of animated vanity counters.

Signature interaction: stamps register into place with one brief back ease. No continuous animation.

### Mobile chapter index

Restore access lost below `760px` with a compact control:

- Wordmark remains left.
- One accessible chapter trigger replaces hidden center links.
- Drawer uses the same paper/ink material.
- Current chapter can be named in mono text.
- Background interaction pauses while open.

Signature interaction: one paper-tab reveal with power easing, not elastic navigation.

### Field notes

Add short technical writing as a typographic index rather than cards:

- Date and topic in mono.
- One wide Bangers or Archivo title depending length.
- One-sentence premise.
- Direct route or external article destination.

Signature interaction: a single red web underline draws on focus/hover and appears instantly under reduced motion.

## 13. Patterns to avoid

Do not add:

- A second marquee.
- Another equal three-card section without a unique information reason.
- A dashboard of nested cards.
- Decorative metrics with no source.
- A glassmorphic modal or gradient mesh.
- A second mascot or theme.
- Stock 3D models with unrelated lighting.
- Bounce/elastic motion on routine product states.
- Another custom cursor mode.
- More permanent RAF loops without lifecycle control.
- Another fake loader.
- Hover-only project details.
- Hidden mobile functionality.
- A framework migration whose only outcome is reproducing the same static page.

## 14. Continuation scorecard

Score a proposal from `0` to `2` on each axis.

| Axis | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Narrative fit | Generic portfolio/SaaS pattern | Themed copy only | Form, copy, and interaction extend the world |
| Information architecture | Appended arbitrarily | Plausible location | Advances the visitor decision path |
| Type roles | Random use | Mostly consistent | Exact action/system/human/neutral split |
| Color discipline | New palette or decorative gradient | Existing colors used loosely | Existing colors have clear semantic roles |
| Geometry | Generic surface | Partial comic styling | Ink border, hard shadow, controlled rotation |
| Motion | Decorative overload | Standard reveal only | One purposeful signature response |
| Interaction states | Hover only | Keyboard usable | Complete perceivable state model |
| Responsive behavior | Desktop collapse | Basic stacking | Deliberate width and input adaptations |
| Accessibility/resilience | Decorative only | Semantics present | Focus, reduced motion, fallback verified |
| Evidence/task value | Decoration | Informative | Real destination, proof, or completed action |

Require at least `17/20`. Interaction states, responsive behavior, and accessibility/resilience must each score `2`.

## 15. Implementation sequence

Use this order for every substantial feature:

1. Write the visitor problem and desired outcome in one sentence each.
2. Classify the feature and place it in the story.
3. Choose one information composition not already overused.
4. Map type, color, surface, and layer roles from `DESIGN.md`.
5. Define semantic markup and the complete state model.
6. Define one signature interaction and its reduced-motion state.
7. Identify scroll-height and persistent-world consequences.
8. Establish transform and lifecycle ownership.
9. Implement with final copy and realistic content dimensions.
10. Test the responsive, input, accessibility, fallback, and performance matrices.
11. Record the new component or rule in `DESIGN.md` only if it is reusable and canonical.
12. Re-score the final implementation and reject it if mandatory axes fall below `2`.

## 16. Definition of done

A feature is ready only when:

- Its purpose is clear before animation.
- Its location improves the visitor story.
- It belongs to the existing world without copying a whole section template.
- Its text uses the correct action, system, human, and neutral voices.
- Its colors have semantic roles.
- It has one dominant composition and one signature interaction.
- Every interactive state is perceivable and keyboard reachable.
- Coarse pointer and reduced motion receive deliberate behavior.
- Core content survives unavailable WebGL, unavailable animation libraries, and failed CDNs.
- Global web/camera pacing has been inspected at desktop and mobile heights.
- Temporary resources and loops have complete lifecycles.
- It scores at least `17/20` with all mandatory axes at `2`.

Following this playbook preserves the part of the Fable result that matters: not its individual tricks, but the discipline of making one concept govern content, material, motion, interaction, and code.
