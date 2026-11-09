# Claude Code, Cursor & Windsurf Integration Guide

Add this skill to your workspace rules so AI coding assistants follow Apple Fluid Motion standards automatically.

## 1. Cursor (`.cursorrules`)
Create or edit `.cursorrules` in your project root:
```markdown
# Apple Fluid Motion & Zero-Distortion Rule
When building UI transitions, device mockups, modals, or island switchers:
- Use Apple Fluid Spring physics:
  - Dynamic Island / Pills: tau = 0.60s, zeta = 0.88
  - Window & Chassis Morphing: tau = 0.65s, zeta = 0.94
- Solve using Semi-Implicit Euler integration with energy early-exit threshold (< 0.25px, < 0.25v).
- Enforce proportional uniform scaling: `scale(screenW / virtualW)` with `transform-origin: 0 0`. No 2D stretching.
- Use eager visual posters for iframes with 500ms smooth crossfade.
- Include WebKit Jetsam unmount guards for memory release on iOS Safari.
```

## 2. Windsurf (`.windsurfrules`)
Add the same directives into `.windsurfrules`.

## 3. Claude Code (`CLAUDE.md`)
Add to `CLAUDE.md`:
```markdown
## Motion & UI Guidelines
Always reference the Apple Fluid Morph skill in `SKILL.md` when designing interactive components, device mockups, or transitions.
```
