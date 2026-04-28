import { useState, useEffect, useCallback } from 'react';

interface SocModeProps {
  children: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

export function SocModeButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-mono border rounded transition-all flex items-center gap-2 ${
        active
          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
          : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
      }`}
    >
      ⛶ {active ? 'EXIT SOC MODE' : 'SOC MODE'}
    </button>
  );
}

export function SocModeWrapper({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  useEffect(() => {
    if (enabled) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [enabled]);

  // Listen for ESC exit
  useEffect(() => {
    const handler = () => {
      // Fullscreen change is handled by the parent component
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-40 bg-black overflow-auto">
      {children}
    </div>
  );
}
