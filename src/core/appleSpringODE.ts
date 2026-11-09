/**
 * Apple Fluid Spring Physics Engine (Analytical ODE & Semi-Implicit Euler)
 *
 * Models real physical mass-spring-damper systems:
 *   m*x'' + c*x' + k*(x - target) = 0
 *
 * Parameterized by:
 *   - Response (tau): natural period of oscillation in seconds.
 *   - Damping Ratio (zeta): dimensionless ratio determining oscillation dampening:
 *       zeta < 1 : underdamped (snappy bounce)
 *       zeta = 1 : critically damped (fastest return without overshoot)
 *       zeta > 1 : overdamped (soft floating settling)
 *
 * Calibrated Presets:
 *   - CAPSULE_PILL:    tau = 0.60s, zeta = 0.88 (snappy, tactile Dynamic Island)
 *   - WINDOW_CHASSIS:  tau = 0.65s, zeta = 0.94 (fluid, elegant window morphing)
 */

export interface SpringConfig {
  response: number; // tau (seconds)
  damping: number;  // zeta (damping ratio)
}

export interface SpringState1D {
  value: number;
  velocity: number;
  target: number;
  lastTime: number | null;
  rafId: number | null;
  initialized: boolean;
}

export interface SpringState2D {
  w: number;
  h: number;
  vW: number;
  vH: number;
  targetW: number;
  targetH: number;
  lastTime: number | null;
  rafId: number | null;
  initialized: boolean;
}

/** Standard Apple Human Interface Guideline fluid calibrated presets */
export const APPLE_PRESETS = {
  /** Dynamic Island capsule pill: quick reveal, subtle organic bounce */
  CAPSULE_PILL: { response: 0.60, damping: 0.88 } as const,
  /** Device chassis & window morphing: elegant, zero-distortion morphing */
  WINDOW_CHASSIS: { response: 0.65, damping: 0.94 } as const,
  /** Fullscreen modal expand: fast, fluid entry */
  MODAL_EXPAND: { response: 0.50, damping: 0.86 } as const,
  /** Interactive cards: subtle tactile spring feedback */
  TACTILE_CARD: { response: 0.45, damping: 0.80 } as const,
} as const;

/**
 * Computes the angular frequency (omega_n), spring constant (k),
 * and damping coefficient (c) for a unit mass (m = 1).
 */
export function calculateODEConstants(config: SpringConfig) {
  const omega_n = (2 * Math.PI) / Math.max(0.01, config.response);
  const k = omega_n * omega_n;
  const c = 2 * config.damping * omega_n;
  return { omega_n, k, c };
}

/**
 * Performs a single Semi-Implicit Euler integration step for a 1D spring.
 * Semi-implicit Euler updates velocity first, then position with the new velocity,
 * providing symplectic energy conservation and superior numerical stability over standard Euler.
 *
 * @param current Current position
 * @param velocity Current velocity
 * @param target Target destination
 * @param dt Delta time in seconds (clamped to 0.02s / 50Hz to prevent explosion during frame drops)
 * @param k Spring constant (omega_n^2)
 * @param c Damping coefficient (2 * zeta * omega_n)
 */
export function integrateEuler1D(
  current: number,
  velocity: number,
  target: number,
  dt: number,
  k: number,
  c: number
): { value: number; velocity: number } {
  const clampedDt = Math.min(Math.max(dt, 0.0001), 0.02);
  const force = -k * (current - target) - c * velocity;
  const nextVelocity = velocity + force * clampedDt;
  const nextValue = current + nextVelocity * clampedDt;
  return { value: nextValue, velocity: nextVelocity };
}

/**
 * Evaluates whether a 1D spring has converged below the energy threshold.
 * Allows early termination of requestAnimationFrame loops to conserve battery and CPU/GPU.
 */
export function hasSpringSettled(
  current: number,
  target: number,
  velocity: number,
  thresholdPos = 0.25,
  thresholdVel = 0.25
): boolean {
  return (
    Math.abs(current - target) < thresholdPos &&
    Math.abs(velocity) < thresholdVel
  );
}

/**
 * Creates an empty 1D spring state.
 */
export function createSpringState1D(initialValue = 0): SpringState1D {
  return {
    value: initialValue,
    velocity: 0,
    target: initialValue,
    lastTime: null,
    rafId: null,
    initialized: false,
  };
}

/**
 * Creates an empty 2D (width/height) spring state.
 */
export function createSpringState2D(initialW = 0, initialH = 0): SpringState2D {
  return {
    w: initialW,
    h: initialH,
    vW: 0,
    vH: 0,
    targetW: initialW,
    targetH: initialH,
    lastTime: null,
    rafId: null,
    initialized: false,
  };
}
