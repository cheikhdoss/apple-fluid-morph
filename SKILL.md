---
name: apple-fluid-morph
description: Universal AI Agent Skill for Apple Fluid Spring Motion, Dynamic Island Capsules, and Multi-Device Morphing with Zero-Distortion Scaling
version: 1.0.0
author: cheikhdoss
license: MIT
tags:
  - apple-motion
  - spring-physics
  - ode-solver
  - dynamic-island
  - zero-distortion
  - anti-slop
  - webkit-jetsam-guard
---

# Apple Fluid Morph · Universal AI Agent Skill

This skill instructs any AI agent (Antigravity, Cursor, Windsurf, Open Interpreter, Claude Code, GPTs, OpenCode) on how to architect, calibrate, and implement **Apple Fluid Spring Motion**, **Dynamic Island Capsules**, **Multi-Device Morphing Mockups**, and **Zero-Distortion Proportional Scaling** in modern web applications.

---

## 1. Physical Foundations: The Spring ODE

Never use naive CSS `ease-in-out`, generic linear transitions, or uncalibrated Framer Motion defaults. All fluid physical motion follows the second-order Ordinary Differential Equation (ODE):

$$m \ddot{x} + c \dot{x} + k (x - x_{\text{target}}) = 0$$

Assuming unit mass ($m = 1$), the motion is parameterized by:
- **$\tau$ (Response Time)**: Natural period of oscillation in seconds.
- **$\zeta$ (Damping Ratio)**: Dimensionless ratio controlling oscillation decay.

### Exact Parameter Formulas
$$\omega_n = \frac{2\pi}{\tau}$$
$$k = \omega_n^2$$
$$c = 2 \zeta \omega_n$$

### Numerical Integration (Semi-Implicit Euler)
Standard Euler integration introduces artificial energy drift. Use **Semi-Implicit Euler (Symplectic)**, which updates velocity first, then position with the newly calculated velocity:

```typescript
const force = -k * (current - target) - c * velocity;
const nextVelocity = velocity + force * dt;
const nextPosition = current + nextVelocity * dt;
```
> [!IMPORTANT]
> Clamp `dt` to a maximum of `0.02s` (50Hz) to prevent mathematical instability or explosive divergence during sudden frame drops or background tab switching.

---

## 2. Inviolable Apple Calibrations

Through rigorous perceptual benchmarking on high-refresh Retina screens (120Hz ProMotion):

| Component / Interaction | $\tau$ (Response) | $\zeta$ (Damping) | Behavior Characteristics |
| :--- | :--- | :--- | :--- |
| **Dynamic Island Capsule Pill** | **0.60s** | **0.88** | Snappy, tactile, organic micro-bounce. Zero perception of lag. |
| **Window / Device Morphing Chassis** | **0.65s** | **0.94** | Liquid settling, subtle deceleration, zero visual overshoot. |
| **Fullscreen Modal Expansion** | **0.50s** | **0.86** | Instantaneous feel, high initial momentum, rapid stabilization. |
| **Tactile Interactive Cards** | **0.45s** | **0.80** | Subtle haptic rebound on click or release. |

### Energy Threshold Early-Exit
To avoid draining CPU/GPU battery with infinitesimal floating-point oscillations:
```typescript
if (Math.abs(position - target) < 0.25 && Math.abs(velocity) < 0.25) {
  position = target;
  velocity = 0;
  cancelAnimationFrame(rafId);
}
```

---

## 3. The Zero-Distortion Rule (Proportional Uniform Scaling)

> [!CAUTION]
> **ABSOLUTE BAN ON 2D NON-UNIFORM STRETCHING**: Never apply independent `scaleX` and `scaleY` to responsive device mockups. This warps typography, distorts button geometry, and creates amateurish visual stretching.

### Correct Algorithm:
1. Compute available display width inside the chassis:
   $$screenWidth = displayWidth - (bezelLeft + bezelRight)$$
2. Compute the uniform proportional scale factor:
   $$curScale = \frac{screenWidth}{virtualWidth}$$
3. Apply uniform scaling anchored at top-left:
   ```css
   transform: scale(curScale) translateZ(0);
   transform-origin: 0 0;
   ```
4. Render the inner layout at standard native virtual dimensions:
   - **Mobile**: $390 \times 844\text{px}$
   - **Tablet**: $768 \times 1024\text{px}$
   - **Desktop**: $1280 \times 800\text{px}$ or $1440 \times 900\text{px}$

---

## 4. Hardware Bezels Architecture

When switching preview modes, morph the surrounding hardware bezels smoothly:

1. **iPad Tablet Bezel**:
   - Smoky glass chassis: `border-2 border-white/20 shadow-2xl`
   - Hardware side volume buttons: `-right-[3px] top-20 w-[3px] h-8 bg-zinc-600/80`
   - Centered camera dot with blue lens reflection: `size-2 rounded-full bg-black border border-zinc-700/80`
   - Ambient emerald back-glow: `bg-emerald-500/10 blur-3xl rounded-full`

2. **MacBook Pro Laptop Bezel**:
   - Obsidian chassis: `bg-[#000000] border border-white/20`
   - macOS Traffic Lights: `#ff5f57` (red), `#febc2e` (amber), `#28c840` (green) at `top-1.5 left-2.5`
   - Center webcam dot
   - Aluminum bottom hinge: `bg-gradient-to-b from-[#2a2a36] to-[#000000]` with notch groove

3. **iPhone Titanium Bezel**:
   - High-grade titanium edge: `border-2 border-white/20 rounded-[36px]`
   - Top ear-speaker slit: `w-12 h-1 bg-zinc-800 rounded-full border border-zinc-700/60`
   - Bottom gesture home indicator bar: `w-28 h-1 bg-white/30 rounded-full`

---

## 5. Instant 0ms Visual Poster (Anti-Black-Screen)

When opening an iframe preview or remote content, network latency creates a 1 to 3 second blank void.
**Mandatory Pattern**:
1. Mount the already-cached preview thumbnail as an eager poster behind/over the iframe:
   ```html
   <img src={poster} loading="eager" decoding="sync" class="w-full h-full object-cover object-top select-none" />
   ```
2. Set container background to deep obsidian (`#0c0c0e`), never raw white or harsh transparent.
3. Show an Apple-style top progress line (`h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse`).
4. Display a discreet floating glass badge (`Connexion live...`).
5. Crossfade smoothly over 500ms once `onLoad` fires:
   - Poster: `opacity-100` $\to$ `opacity-0`
   - Iframe: `opacity-0` $\to$ `opacity-100`

---

## 6. WebKit / Safari Jetsam Memory Purge

iOS Safari terminates WebProcesses that retain heavy canvas/video textures when users switch between previews.
**Mandatory Unmount Guard**:
```javascript
useEffect(() => {
  const iframe = iframeRef.current;
  return () => {
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.querySelectorAll('video, audio').forEach(el => {
          el.pause();
          el.src = '';
          el.load();
        });
        doc.querySelectorAll('canvas').forEach(canvas => {
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
          if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
          canvas.width = 1;
          canvas.height = 1;
        });
        if (doc.body) doc.body.innerHTML = '';
      }
      iframe.src = 'about:blank';
    } catch (_) {}
  };
}, []);
```

---

## 7. Dynamic Island Capsule Interaction

The floating device switcher must feature:
1. **Resting State (64px)**: Pill with device icon + pulsing emerald dot.
2. **Expanded State (280px)**: 3 tactile segmented buttons (Mobile, Tablet, Desktop).
3. **Auto-Retract**: Closes automatically 1.0s after selection.
4. **Click-Outside Listener**: Automatically collapses when tapping anywhere else on the screen.

---

## 8. Anti-Patterns to Refuse (Quality Gate)

- ❌ `transition: all 0.3s ease` (flat, dead, robotic).
- ❌ Re-rendering React state on every frame (causes jank at 120fps; always use direct DOM style injection).
- ❌ Separate `scaleX` and `scaleY` (warps elements).
- ❌ Dark overlays that obscure the poster image with blurry black voids.
- ❌ Leaking WebGL or video resources between preview unmounts.
