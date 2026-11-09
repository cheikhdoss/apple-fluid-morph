import React, { useRef, useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { DeviceType } from '../core/deviceGeometry';
import {
  APPLE_PRESETS,
  calculateODEConstants,
  integrateEuler1D,
  hasSpringSettled,
  createSpringState1D,
} from '../core/appleSpringODE';

export interface DynamicIslandPillProps {
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  className?: string;
  autoRetractMs?: number;
}

/**
 * DynamicIslandPill: Apple Dynamic Island Floating Switcher
 *
 * Implements the Apple Spring ODE (tau = 0.60s, zeta = 0.88)
 * for fluid width, scale, and opacity morphing between resting bubble (64px)
 * and expanded mode selector (280px).
 */
export function DynamicIslandPill({
  device,
  onDeviceChange,
  className = '',
  autoRetractMs = 1000,
}: DynamicIslandPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const restingRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const springRef = useRef(createSpringState1D(64));
  const autoCollapseTimer = useRef<NodeJS.Timeout | null>(null);

  const targetWidth = isOpen ? 280 : 64;
  const { k, c } = calculateODEConstants(APPLE_PRESETS.CAPSULE_PILL);

  // Direct GPU DOM style injection to avoid React re-renders at 120fps
  useEffect(() => {
    const state = springRef.current;
    state.target = targetWidth;

    const step = (timestamp: number) => {
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = (timestamp - state.lastTime) / 1000;
      state.lastTime = timestamp;

      const next = integrateEuler1D(state.value, state.velocity, state.target, dt, k, c);
      state.value = next.value;
      state.velocity = next.velocity;

      // 1. Width morphing
      if (containerRef.current) {
        containerRef.current.style.width = `${state.value.toFixed(1)}px`;
      }

      // 2. Interpolate crossfade and scale between 64px and 280px
      const progress = Math.max(0, Math.min(1, (state.value - 64) / (280 - 64)));

      if (restingRef.current) {
        restingRef.current.style.opacity = `${(1 - progress).toFixed(3)}`;
        restingRef.current.style.transform = `scale(${(1 - progress * 0.25).toFixed(3)})`;
      }

      if (optionsRef.current) {
        optionsRef.current.style.opacity = `${progress.toFixed(3)}`;
        optionsRef.current.style.transform = `scale(${(0.85 + progress * 0.15).toFixed(3)})`;
      }

      if (hasSpringSettled(state.value, state.target, state.velocity, 0.2, 0.2)) {
        state.value = state.target;
        state.velocity = 0;
        state.lastTime = null;
        state.rafId = null;

        if (containerRef.current) {
          containerRef.current.style.width = `${state.target}px`;
        }
        return;
      }

      state.rafId = requestAnimationFrame(step);
    };

    if (!state.rafId) {
      state.lastTime = null;
      state.rafId = requestAnimationFrame(step);
    }

    return () => {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
    };
  }, [targetWidth, k, c]);

  // Click outside to collapse
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 250);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newDevice: DeviceType) => {
    onDeviceChange(newDevice);
    if (autoCollapseTimer.current) clearTimeout(autoCollapseTimer.current);
    autoCollapseTimer.current = setTimeout(() => {
      setIsOpen(false);
    }, autoRetractMs);
  };

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-50 select-none ${className}`}
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        ref={containerRef}
        onClick={() => {
          if (!isOpen) setIsOpen(true);
        }}
        aria-label="Apple Dynamic Island Switcher"
        style={{
          width: '64px',
          height: '36px',
          borderRadius: '9999px',
          willChange: 'width',
        }}
        className={`relative flex items-center justify-center overflow-hidden bg-[#0c0c0e]/95 backdrop-blur-xl border shadow-[0_12px_36px_rgba(0,0,0,0.85)] transition-colors duration-200 ${
          isOpen ? 'border-white/20' : 'border-white/30 cursor-pointer hover:border-white/60'
        }`}
      >
        {/* 1. Resting collapsed bubble (64px) */}
        <div
          ref={restingRef}
          style={{ opacity: 1, transform: 'scale(1)' }}
          className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none"
        >
          <div className="flex items-center justify-center text-white">
            {device === 'mobile' && <Smartphone className="size-3.5 text-white" />}
            {device === 'tablet' && <Tablet className="size-3.5 text-white" />}
            {device === 'desktop' && <Monitor className="size-3.5 text-white" />}
          </div>
          <span className="size-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
        </div>

        {/* 2. Expanded Options Pill (280px) */}
        <div
          ref={optionsRef}
          style={{ opacity: 0, transform: 'scale(0.85)' }}
          className={`absolute inset-0 flex items-center justify-between gap-1 px-1.5 ${
            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('mobile');
            }}
            className={`flex-1 h-7 rounded-full text-xs font-mono flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer ${
              device === 'mobile'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="size-3.5" />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('tablet');
            }}
            className={`flex-1 h-7 rounded-full text-xs font-mono flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer ${
              device === 'tablet'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tablet className="size-3.5" />
            <span>Tablette</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('desktop');
            }}
            className={`flex-1 h-7 rounded-full text-xs font-mono flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer ${
              device === 'desktop'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="size-3.5" />
            <span>Bureau</span>
          </button>
        </div>
      </div>
    </div>
  );
}
