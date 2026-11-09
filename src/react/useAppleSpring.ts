import { useRef, useEffect, useCallback } from 'react';
import {
  SpringConfig,
  APPLE_PRESETS,
  calculateODEConstants,
  integrateEuler1D,
  hasSpringSettled,
  createSpringState1D,
} from '../core/appleSpringODE';

/**
 * useAppleSpring: High-performance 1D spring hook.
 * Uses requestAnimationFrame with semi-implicit Euler integration.
 * Injects updates directly via an imperative callback to bypass React reconciliation at 120fps.
 */
export function useAppleSpring(
  target: number,
  config: SpringConfig = APPLE_PRESETS.CAPSULE_PILL,
  onUpdate: (value: number) => void
) {
  const stateRef = useRef(createSpringState1D(target));
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  const { k, c } = calculateODEConstants(config);

  const startAnimation = useCallback(() => {
    const state = stateRef.current;
    if (state.rafId) return;

    const step = (timestamp: number) => {
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = (timestamp - state.lastTime) / 1000;
      state.lastTime = timestamp;

      const next = integrateEuler1D(state.value, state.velocity, state.target, dt, k, c);
      state.value = next.value;
      state.velocity = next.velocity;

      callbackRef.current(state.value);

      if (hasSpringSettled(state.value, state.target, state.velocity)) {
        state.value = state.target;
        state.velocity = 0;
        state.lastTime = null;
        state.rafId = null;
        callbackRef.current(state.target);
        return;
      }

      state.rafId = requestAnimationFrame(step);
    };

    state.lastTime = null;
    state.rafId = requestAnimationFrame(step);
  }, [k, c]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state.initialized) {
      state.initialized = true;
      state.value = target;
      state.target = target;
      callbackRef.current(target);
      return;
    }

    if (state.target !== target) {
      state.target = target;
      startAnimation();
    }
  }, [target, startAnimation]);

  useEffect(() => {
    return () => {
      const state = stateRef.current;
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
    };
  }, []);
}
