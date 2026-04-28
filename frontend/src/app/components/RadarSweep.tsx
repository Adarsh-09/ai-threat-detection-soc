import { useEffect, useState, useMemo } from 'react';

interface RadarSweepProps {
  threatLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Blip {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const LEVEL_CONFIG = {
  LOW: {
    color: 'rgb(34, 197, 94)',       // green-500
    colorFaded: 'rgba(34, 197, 94,',
    spinDuration: '6s',
    blipCount: 2,
    ringGlow: '0 0 15px rgba(34, 197, 94, 0.2)',
    centerGlow: '0 0 8px rgba(34, 197, 94, 0.6)',
    pulseIntensity: false,
  },
  MEDIUM: {
    color: 'rgb(234, 179, 8)',       // yellow-500
    colorFaded: 'rgba(234, 179, 8,',
    spinDuration: '3s',
    blipCount: 4,
    ringGlow: '0 0 20px rgba(234, 179, 8, 0.3)',
    centerGlow: '0 0 12px rgba(234, 179, 8, 0.7)',
    pulseIntensity: false,
  },
  HIGH: {
    color: 'rgb(239, 68, 68)',       // red-500
    colorFaded: 'rgba(239, 68, 68,',
    spinDuration: '1.5s',
    blipCount: 6,
    ringGlow: '0 0 30px rgba(239, 68, 68, 0.5)',
    centerGlow: '0 0 16px rgba(239, 68, 68, 0.9)',
    pulseIntensity: true,
  },
};

function generateBlips(count: number): Blip[] {
  const blips: Blip[] = [];
  for (let i = 0; i < count; i++) {
    // Place blips in random positions within the radar circle
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.2 + Math.random() * 0.65; // 20%-85% from center
    blips.push({
      id: i,
      x: 50 + Math.cos(angle) * radius * 42,  // percentage coordinates
      y: 50 + Math.sin(angle) * radius * 42,
      size: 4 + Math.random() * 4,
      delay: Math.random() * 2,
    });
  }
  return blips;
}

export function RadarSweep({ threatLevel = 'LOW' }: RadarSweepProps) {
  const cfg = LEVEL_CONFIG[threatLevel];
  const [blips, setBlips] = useState<Blip[]>(() => generateBlips(cfg.blipCount));

  // Regenerate blips when threat level changes
  useEffect(() => {
    setBlips(generateBlips(LEVEL_CONFIG[threatLevel].blipCount));
  }, [threatLevel]);

  // Periodically shift blips for HIGH threat
  useEffect(() => {
    if (threatLevel !== 'HIGH') return;
    const iv = setInterval(() => {
      setBlips((prev: Blip[]) => prev.map((b: Blip) => ({
        ...b,
        x: b.x + (Math.random() - 0.5) * 3,
        y: b.y + (Math.random() - 0.5) * 3,
      })));
    }, 800);
    return () => clearInterval(iv);
  }, [threatLevel]);

  return (
    <div className="relative w-48 h-48" style={{ filter: `drop-shadow(${cfg.ringGlow})` }}>
      {/* Concentric rings */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-700"
        style={{ border: `2px solid ${cfg.colorFaded}0.35)` }}
      />
      <div
        className="absolute inset-4 rounded-full transition-colors duration-700"
        style={{ border: `1px solid ${cfg.colorFaded}0.2)` }}
      />
      <div
        className="absolute inset-8 rounded-full transition-colors duration-700"
        style={{ border: `1px solid ${cfg.colorFaded}0.2)` }}
      />
      <div
        className="absolute inset-12 rounded-full transition-colors duration-700"
        style={{ border: `1px solid ${cfg.colorFaded}0.15)` }}
      />

      {/* Cross-hairs */}
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px transition-colors duration-700"
        style={{ background: `${cfg.colorFaded}0.1)` }}
      />
      <div
        className="absolute left-0 right-0 top-1/2 h-px transition-colors duration-700"
        style={{ background: `${cfg.colorFaded}0.1)` }}
      />

      {/* Sweep arm */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 origin-center"
          style={{ animation: `spin ${cfg.spinDuration} linear infinite` }}
        >
          {/* Sweep line */}
          <div
            className="absolute top-1/2 left-1/2 w-full h-0.5"
            style={{
              background: `linear-gradient(to right, ${cfg.colorFaded}0) 0%, ${cfg.colorFaded}0.6) 50%, ${cfg.color} 100%)`,
              transform: 'translate(-50%, -50%) rotate(0deg)',
              transformOrigin: '0% 50%',
              boxShadow: `0 0 6px ${cfg.color}`,
            }}
          />
          {/* Sweep cone/fade trail */}
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, ${cfg.colorFaded}0.12) 0deg, ${cfg.colorFaded}0) 60deg, transparent 60deg)`,
              borderRadius: '50%',
            }}
          />
        </div>
      </div>

      {/* Center dot */}
      <div
        className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse transition-colors duration-700"
        style={{ background: cfg.color, boxShadow: cfg.centerGlow }}
      />

      {/* Dynamic blips */}
      {blips.map((b: Blip) => (
        <div
          key={b.id}
          className="absolute rounded-full transition-all duration-500"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: cfg.color,
            boxShadow: `0 0 ${b.size + 4}px ${cfg.color}`,
            opacity: 0.9,
            transform: 'translate(-50%, -50%)',
            animation: `pulse ${1 + b.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Outer glow ring for HIGH */}
      {cfg.pulseIntensity && (
        <div
          className="absolute -inset-2 rounded-full animate-pulse"
          style={{
            border: `1px solid ${cfg.colorFaded}0.3)`,
            boxShadow: `0 0 25px ${cfg.colorFaded}0.2), inset 0 0 25px ${cfg.colorFaded}0.05)`,
          }}
        />
      )}
    </div>
  );
}
