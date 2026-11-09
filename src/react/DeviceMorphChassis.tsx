import React, { useRef, useEffect } from 'react';
import { DeviceType, getDeviceGeometry } from '../core/deviceGeometry';
import {
  APPLE_PRESETS,
  calculateODEConstants,
  integrateEuler1D,
  hasSpringSettled,
  createSpringState2D,
} from '../core/appleSpringODE';

export interface DeviceMorphChassisProps {
  device: DeviceType;
  containerWidth: number;
  containerHeight: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * DeviceMorphChassis: Fluid Multi-Device Morphing Chassis
 *
 * Implements:
 * 1. Apple Fluid Spring ODE (tau = 0.65s, zeta = 0.94) for window morphing.
 * 2. 100% Zero-Distortion Proportional Uniform Scaling: scale = screenW / virtualW.
 * 3. Physical hardware bezels: iPad glass, MacBook Pro, iPhone Titanium.
 */
export function DeviceMorphChassis({
  device,
  containerWidth,
  containerHeight,
  children,
  className = '',
}: DeviceMorphChassisProps) {
  const geom = getDeviceGeometry(device, containerWidth, containerHeight);

  const chassisRef = useRef<HTMLDivElement>(null);
  const virtualBoxRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const tabletBezelRef = useRef<HTMLDivElement>(null);
  const laptopBezelRef = useRef<HTMLDivElement>(null);
  const phoneBezelRef = useRef<HTMLDivElement>(null);

  const springStateRef = useRef(createSpringState2D(geom.displayW, geom.displayH));
  const hasUserSwitchedRef = useRef(false);

  const { k, c } = calculateODEConstants(APPLE_PRESETS.WINDOW_CHASSIS);

  useEffect(() => {
    const state = springStateRef.current;
    const targetW = geom.displayW;
    const targetH = geom.displayH;
    const targetPadL = geom.bezelLeft;
    const targetPadR = geom.bezelRight;
    const targetPadT = geom.bezelTop;
    const targetPadB = geom.bezelBottom;
    const targetChassisRad = geom.chassisRadius;
    const targetScreenRad = geom.borderRadius;
    const virtualW = geom.virtualW;
    const renderH = geom.renderH;

    // 1. Direct synchronous update of inner container bounds
    if (contentWrapperRef.current) {
      contentWrapperRef.current.style.width = `${virtualW}px`;
      contentWrapperRef.current.style.height = `${renderH}px`;
    }

    if (virtualBoxRef.current) {
      virtualBoxRef.current.style.paddingLeft = `${targetPadL}px`;
      virtualBoxRef.current.style.paddingRight = `${targetPadR}px`;
      virtualBoxRef.current.style.paddingTop = `${targetPadT}px`;
      virtualBoxRef.current.style.paddingBottom = `${targetPadB}px`;
    }

    if (tabletBezelRef.current) {
      tabletBezelRef.current.style.opacity = `${geom.isTablet ? 1 : 0}`;
      tabletBezelRef.current.style.borderRadius = `${targetChassisRad}px`;
    }

    if (laptopBezelRef.current) {
      laptopBezelRef.current.style.opacity = `${geom.isPcMockup ? 1 : 0}`;
      laptopBezelRef.current.style.borderRadius = `${targetChassisRad}px`;
    }

    if (phoneBezelRef.current) {
      phoneBezelRef.current.style.opacity = `${geom.isPhoneMockup ? 1 : 0}`;
      phoneBezelRef.current.style.borderRadius = `${targetChassisRad}px`;
    }

    if (screenRef.current) {
      screenRef.current.style.borderRadius = `${targetScreenRad}px`;
    }

    // First mount before user switch: instant sync with zero animation
    if (!hasUserSwitchedRef.current || (!state.initialized && targetW > 0 && targetH > 0)) {
      state.initialized = true;
      hasUserSwitchedRef.current = true;
      state.w = targetW;
      state.h = targetH;
      state.vW = 0;
      state.vH = 0;

      if (chassisRef.current) {
        chassisRef.current.style.width = `${targetW}px`;
        chassisRef.current.style.height = `${targetH}px`;
      }
      if (contentWrapperRef.current) {
        const screenW = Math.max(10, targetW - (targetPadL + targetPadR));
        const curScale = screenW / virtualW;
        contentWrapperRef.current.style.transform = curScale === 1 ? 'none' : `scale(${curScale.toFixed(4)}) translateZ(0)`;
      }
      return;
    }

    state.targetW = targetW;
    state.targetH = targetH;

    const step = (timestamp: number) => {
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = (timestamp - state.lastTime) / 1000;
      state.lastTime = timestamp;

      // Integrate 2D ODE
      const nextW = integrateEuler1D(state.w, state.vW, state.targetW, dt, k, c);
      state.w = nextW.value;
      state.vW = nextW.velocity;

      const nextH = integrateEuler1D(state.h, state.vH, state.targetH, dt, k, c);
      state.h = nextH.value;
      state.vH = nextH.velocity;

      // Apply dimensions
      if (chassisRef.current) {
        chassisRef.current.style.width = `${state.w.toFixed(1)}px`;
        chassisRef.current.style.height = `${state.h.toFixed(1)}px`;
      }

      // Proportional uniform scale (zero distortion)
      const screenW = Math.max(10, state.w - (targetPadL + targetPadR));
      const curScale = screenW / virtualW;

      if (contentWrapperRef.current) {
        contentWrapperRef.current.style.transform = curScale === 1 ? 'none' : `scale(${curScale.toFixed(4)}) translateZ(0)`;
      }

      // Energy check
      const settledW = hasSpringSettled(state.w, state.targetW, state.vW);
      const settledH = hasSpringSettled(state.h, state.targetH, state.vH);

      if (settledW && settledH) {
        state.w = state.targetW;
        state.h = state.targetH;
        state.vW = 0;
        state.vH = 0;
        state.lastTime = null;
        state.rafId = null;

        if (chassisRef.current) {
          chassisRef.current.style.width = `${state.targetW}px`;
          chassisRef.current.style.height = `${state.targetH}px`;
        }
        if (contentWrapperRef.current) {
          const finalScreenW = Math.max(10, state.targetW - (targetPadL + targetPadR));
          const finalScale = finalScreenW / virtualW;
          contentWrapperRef.current.style.transform = finalScale === 1 ? 'none' : `scale(${finalScale.toFixed(4)}) translateZ(0)`;
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
  }, [geom, k, c]);

  return (
    <div
      ref={chassisRef}
      style={{
        width: `${geom.displayW}px`,
        height: `${geom.displayH}px`,
        willChange: 'width, height',
      }}
      className={`relative flex items-center justify-center shrink-0 ${className}`}
    >
      <div
        ref={virtualBoxRef}
        style={{
          paddingLeft: `${geom.bezelLeft}px`,
          paddingRight: `${geom.bezelRight}px`,
          paddingTop: `${geom.bezelTop}px`,
          paddingBottom: `${geom.bezelBottom}px`,
          transition: 'padding 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="w-full h-full relative flex items-center justify-center overflow-hidden"
      >
        {/* 1. iPad Bezel */}
        <div
          ref={tabletBezelRef}
          style={{ opacity: geom.isTablet ? 1 : 0 }}
          className="absolute inset-0 pointer-events-none border-2 border-white/20 shadow-2xl shadow-black/90 transition-opacity duration-300 z-0"
        />

        {/* 2. MacBook Pro Bezel */}
        <div
          ref={laptopBezelRef}
          style={{ opacity: geom.isPcMockup ? 1 : 0 }}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        >
          <div className="absolute inset-0 bg-[#000000] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95)]" />
          <div className="absolute top-1.5 left-2.5 z-20 flex items-center gap-1">
            <span className="size-1 rounded-full bg-[#ff5f57]" />
            <span className="size-1 rounded-full bg-[#febc2e]" />
            <span className="size-1 rounded-full bg-[#28c840]" />
          </div>
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20">
            <div className="size-1 rounded-full bg-black border border-zinc-700" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[102%] h-2 bg-gradient-to-b from-[#2a2a36] to-[#000000] rounded-b-[4px] border-b border-x border-white/20 flex items-center justify-center">
            <div className="w-8 h-0.5 bg-zinc-600 rounded-full" />
          </div>
        </div>

        {/* 3. iPhone Titanium Bezel */}
        <div
          ref={phoneBezelRef}
          style={{ opacity: geom.isPhoneMockup ? 1 : 0 }}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        >
          <div className="absolute inset-0 bg-[#000000] border-2 border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]" />
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 w-12 h-1 bg-zinc-800 rounded-full border border-zinc-700/60" />
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 w-28 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Inner Screen */}
        <div
          ref={screenRef}
          style={{ borderRadius: `${geom.borderRadius}px` }}
          className={`w-full h-full relative z-10 overflow-hidden bg-[#0c0c0e] ${
            device === 'desktop' ? '' : 'border border-white/10 shadow-inner'
          } flex items-center justify-center shrink-0`}
        >
          <div
            ref={contentWrapperRef}
            style={{
              width: `${geom.virtualW}px`,
              height: `${geom.renderH}px`,
              transform: geom.scale === 1 ? undefined : `scale(${geom.scale}) translateZ(0)`,
              transformOrigin: '0 0',
            }}
            className="absolute top-0 left-0"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
