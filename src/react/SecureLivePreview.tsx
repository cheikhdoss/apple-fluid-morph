import React, { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export interface SecureLivePreviewProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  onLoaded?: () => void;
}

/**
 * SecureLivePreview: Zero-Latency Preview Frame with Safari Jetsam Memory Purge
 *
 * 1. 0ms Initial Display: Eagerly mounts the cached thumbnail poster immediately.
 * 2. Smooth Crossfade: Transitions from poster to live interactive DOM over 500ms.
 * 3. WebKit / Safari Memory Guard: Aggressively purges GPU buffers, WebGL contexts,
 *    audio/video tracks, and resets src to 'about:blank' on unmount to prevent iOS Jetsam terminations.
 */
export function SecureLivePreview({
  src,
  title = 'Live Preview',
  poster,
  className = '',
  onLoaded,
}: SecureLivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoaded) onLoaded();
  };

  // Anti-hang safety fallback
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Aggressive WebKit / Safari Jetsam Memory Purge on unmount
  useEffect(() => {
    const iframe = iframeRef.current;
    return () => {
      if (!iframe) return;
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          // 1. Pause and disconnect media elements
          doc.querySelectorAll('video, audio').forEach((el) => {
            try {
              const media = el as HTMLMediaElement;
              media.pause();
              media.muted = true;
              media.src = '';
              media.load();
            } catch (_) {}
          });

          // 2. Invalidate WebGL contexts and shrink canvas memory
          doc.querySelectorAll('canvas').forEach((canvas) => {
            try {
              const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
              if (gl) {
                const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext();
              }
              canvas.width = 1;
              canvas.height = 1;
            } catch (_) {}
          });

          // 3. Clear DOM tree
          if (doc.body) doc.body.innerHTML = '';
        }

        // 4. Reset iframe source to release native WebProcess memory
        iframe.src = 'about:blank';
      } catch (_) {}
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden bg-[#0c0c0e] ${className}`}>
      {/* 1. Instant Cached Poster (0ms latency, zero black screen) */}
      {poster && (
        <div
          className={`absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-500 ease-out ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <img
            src={poster}
            alt=""
            loading="eager"
            decoding="sync"
            className="w-full h-full object-cover object-top select-none"
          />
        </div>
      )}

      {/* 2. Interactive Live Iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
        referrerPolicy="same-origin"
        className={`w-full h-full flex-1 border-0 bg-transparent relative z-10 transition-opacity duration-500 ease-out ${
          isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
        style={{ colorScheme: 'dark' }}
        loading="eager"
        onLoad={handleLoad}
      />

      {/* 3. Apple-Style Header Progress Line */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse z-30 pointer-events-none" />
      )}

      {/* 4. Subtle Floating Glass Badge */}
      {isLoading && poster && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none transition-opacity duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-white/15 backdrop-blur-md shadow-xl text-[11px] font-mono text-zinc-200">
            <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
            <span className="tracking-tight">Connexion live...</span>
          </div>
        </div>
      )}

      {/* 5. Fallback Spinner if no poster */}
      {!poster && isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3 bg-[#0c0c0e]">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-xs font-mono text-zinc-400">Chargement de l'aperçu...</span>
        </div>
      )}
    </div>
  );
}
