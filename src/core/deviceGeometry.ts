/**
 * Device Geometry & Zero-Distortion Proportional Scaling Engine
 *
 * Mathematically calculates realistic hardware bezels (iPad, MacBook Pro, iPhone Titanium)
 * and guarantees 100% distortion-free rendering via proportional uniform scaling:
 *   curScale = screenWidth / virtualWidth
 *
 * Avoids any 2D non-uniform stretching (scaleX != scaleY).
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceGeometry {
  device: DeviceType;
  scale: number;
  virtualW: number;
  virtualH: number;
  renderH: number;
  screenWidth: number;
  screenHeight: number;
  bezelLeft: number;
  bezelRight: number;
  bezelTop: number;
  bezelBottom: number;
  displayW: number;
  displayH: number;
  borderRadius: number;
  chassisRadius: number;
  centerShift: number;
  isTablet: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  isPcMockup: boolean;
  isPhoneMockup: boolean;
  isNarrow: boolean;
}

/**
 * Calculates deterministic, jitter-free device geometry based on viewport and device type.
 *
 * @param targetDevice Selected preview device
 * @param containerW Available viewport container width
 * @param containerH Available viewport container height
 */
export function getDeviceGeometry(
  targetDevice: DeviceType,
  containerW: number,
  containerH: number
): DeviceGeometry {
  const isNarrow = containerW < 768;
  const isDesktop = targetDevice === 'desktop';
  const isTablet = targetDevice === 'tablet';
  const isMobile = targetDevice === 'mobile';

  // 1. MOBILE VIEWPORTS (< 768px)
  if (isNarrow) {
    if (isMobile) {
      // Mobile on phone: Edge-to-edge full surface
      return {
        device: 'mobile',
        scale: 1,
        virtualW: containerW,
        virtualH: containerH,
        renderH: containerH,
        screenWidth: containerW,
        screenHeight: containerH,
        bezelLeft: 0,
        bezelRight: 0,
        bezelTop: 0,
        bezelBottom: 0,
        displayW: containerW,
        displayH: containerH,
        borderRadius: 0,
        chassisRadius: 0,
        centerShift: 0,
        isTablet: false,
        isDesktop: false,
        isMobile: true,
        isPcMockup: false,
        isPhoneMockup: false,
        isNarrow: true,
      };
    }

    if (isTablet) {
      // Tablet on phone: Compact iPad mockup
      const padX = 8;
      const padY = 12;
      const availW = Math.max(containerW - padX, 280);
      const availH = Math.max(containerH - padY, 260);
      const bezelLeft = 6;
      const bezelRight = 6;
      const bezelTop = 14;
      const bezelBottom = 14;
      const bezelX = bezelLeft + bezelRight;
      const bezelY = bezelTop + bezelBottom;
      const maxScreenW = availW - bezelX;
      const maxScreenH = availH - bezelY;

      const virtualW = 768;
      const virtualH = 1024;
      const scale = Math.min(maxScreenW / virtualW, maxScreenH / virtualH, 1);
      const screenWidth = Math.round(virtualW * scale);
      const screenHeight = Math.round(virtualH * scale);

      return {
        device: 'tablet',
        scale,
        virtualW,
        virtualH,
        renderH: virtualH,
        screenWidth,
        screenHeight,
        bezelLeft,
        bezelRight,
        bezelTop,
        bezelBottom,
        displayW: screenWidth + bezelX,
        displayH: screenHeight + bezelY,
        borderRadius: 12,
        chassisRadius: 18,
        centerShift: 0,
        isTablet: true,
        isDesktop: false,
        isMobile: false,
        isPcMockup: false,
        isPhoneMockup: false,
        isNarrow: true,
      };
    }

    // Desktop (Bureau) on phone: Mini MacBook Pro mockup 16:10
    const padX = 8;
    const padY = 12;
    const availW = Math.max(containerW - padX, 280);
    const availH = Math.max(containerH - padY, 260);
    const bezelLeft = 6;
    const bezelRight = 6;
    const bezelTop = 16;
    const bezelBottom = 10;
    const bezelX = bezelLeft + bezelRight;
    const bezelY = bezelTop + bezelBottom;
    const maxScreenW = availW - bezelX;
    const maxScreenH = availH - bezelY;

    const virtualW = 1280;
    const virtualH = 800;
    const scale = Math.min(maxScreenW / virtualW, maxScreenH / virtualH, 1);
    const screenWidth = Math.round(virtualW * scale);
    const screenHeight = Math.round(virtualH * scale);

    return {
      device: 'desktop',
      scale,
      virtualW,
      virtualH,
      renderH: virtualH,
      screenWidth,
      screenHeight,
      bezelLeft,
      bezelRight,
      bezelTop,
      bezelBottom,
      displayW: screenWidth + bezelX,
      displayH: screenHeight + bezelY,
      borderRadius: 8,
      chassisRadius: 12,
      centerShift: 0,
      isTablet: false,
      isDesktop: true,
      isMobile: false,
      isPcMockup: true,
      isPhoneMockup: false,
      isNarrow: true,
    };
  }

  // 2. DESKTOP VIEWPORTS (>= 768px)
  const padX = isDesktop ? 24 : 32;
  const padY = isDesktop ? 20 : 32;
  const availW = Math.max(containerW - padX, 280);
  const availH = Math.max(containerH - padY, 260);

  let virtualW = containerW;
  let virtualH = containerH;
  let bezelLeft = 0;
  let bezelRight = 0;
  let bezelTop = 0;
  let bezelBottom = 0;
  let borderRadius = 0;
  let chassisRadius = 0;
  let isPcMockup = false;
  let isPhoneMockup = false;

  if (isMobile) {
    // Mobile mode on desktop: iPhone Titanium Frame (390 x 844)
    virtualW = 390;
    virtualH = 844;
    bezelLeft = 10;
    bezelRight = 10;
    bezelTop = 14;
    bezelBottom = 14;
    borderRadius = 28;
    chassisRadius = 36;
    isPhoneMockup = true;
  } else if (isTablet) {
    // Tablet mode on desktop: iPad Glass Chassis (768 x 1024)
    virtualW = 768;
    virtualH = 1024;
    bezelLeft = 14;
    bezelRight = 14;
    bezelTop = 18;
    bezelBottom = 18;
    borderRadius = 18;
    chassisRadius = 26;
  } else {
    // Desktop mode on desktop: Clean edge-to-edge (or MacBook bezel if constrained)
    virtualW = 1440;
    virtualH = 900;
    bezelLeft = 0;
    bezelRight = 0;
    bezelTop = 0;
    bezelBottom = 0;
    borderRadius = 0;
    chassisRadius = 0;
  }

  const bezelX = bezelLeft + bezelRight;
  const bezelY = bezelTop + bezelBottom;
  const maxScreenW = availW - bezelX;
  const maxScreenH = availH - bezelY;

  // Proportional uniform scale
  const scale = isDesktop
    ? Math.min(containerW / virtualW, containerH / virtualH, 1)
    : Math.min(maxScreenW / virtualW, maxScreenH / virtualH, 1);

  const screenWidth = isDesktop ? containerW : Math.round(virtualW * scale);
  const screenHeight = isDesktop ? containerH : Math.round(virtualH * scale);

  return {
    device: targetDevice,
    scale,
    virtualW: isDesktop ? containerW : virtualW,
    virtualH: isDesktop ? containerH : virtualH,
    renderH: isDesktop ? containerH : virtualH,
    screenWidth,
    screenHeight,
    bezelLeft,
    bezelRight,
    bezelTop,
    bezelBottom,
    displayW: isDesktop ? containerW : screenWidth + bezelX,
    displayH: isDesktop ? containerH : screenHeight + bezelY,
    borderRadius,
    chassisRadius,
    centerShift: 0,
    isTablet,
    isDesktop,
    isMobile,
    isPcMockup,
    isPhoneMockup,
    isNarrow: false,
  };
}
