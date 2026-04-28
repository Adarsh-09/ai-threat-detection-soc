import { useEffect, useState } from 'react';
import { ThreatResponse } from '../../api/threatApi';

interface AttackWorldMapProps {
  lastResult: ThreatResponse | null;
}

export function AttackWorldMap({ lastResult }: AttackWorldMapProps) {
  const [markers, setMarkers] = useState<{ lat: number; lng: number; type: string; id: number; country: string }[]>([]);

  useEffect(() => {
    if (lastResult?.location) {
      const newMarker = {
        lat: lastResult.location.lat,
        lng: lastResult.location.lng,
        type: lastResult.attack_type || 'Normal',
        country: lastResult.location.country || 'Unknown',
        id: Date.now()
      };
      setMarkers(prev => [...prev, newMarker].slice(-5));
      
      // Remove marker after 5 seconds
      const timer = setTimeout(() => {
        setMarkers(prev => prev.filter(m => m.id !== newMarker.id));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastResult]);

  const ATTACK_COLORS: Record<string, string> = {
    Normal: '#10b981', DoS: '#ef4444', Probe: '#eab308', R2L: '#f97316', U2R: '#a855f7',
  };

  // Very simplified lat/lng to XY conversion for a 400x200 SVG map
  const getXY = (lat: number, lng: number) => {
    const x = (lng + 180) * (400 / 360);
    const y = (90 - lat) * (200 / 180);
    return { x, y };
  };

  return (
    <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-cyan-400 text-xs font-mono tracking-wider">GLOBAL THREAT MAP</h3>
        <div className="flex gap-2 text-[10px] font-mono">
          <span className="text-red-400">● LIVE ATTACKS</span>
          <span className="text-gray-500">● SIGNATURES</span>
        </div>
      </div>

      <div className="relative aspect-[2/1] bg-gray-900/50 rounded border border-cyan-500/10 overflow-hidden">
        {/* Simple World SVG Placeholder */}
        <svg viewBox="0 0 400 200" className="w-full h-full opacity-20">
          <path
            fill="#06b6d4"
            d="M310,40 L320,45 L330,40 L335,50 L325,60 L310,55 Z M100,50 L120,40 L140,50 L130,70 L110,80 Z M200,100 L220,90 L240,100 L230,120 L210,130 Z M50,120 L70,110 L90,120 L80,140 L60,150 Z"
          />
          {/* Faint grid lines */}
          <g stroke="#06b6d4" strokeWidth="0.1" strokeDasharray="1,1">
            {[0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400].map(x => <line key={x} x1={x} y1="0" x2={x} y2="200" />)}
            {[0, 40, 80, 120, 160, 200].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} />)}
          </g>
        </svg>

        {/* Live Markers */}
        {markers.map(m => {
          const { x, y } = getXY(m.lat, m.lng);
          const color = ATTACK_COLORS[m.type] || '#fff';
          return (
            <div
              key={m.id}
              className="absolute pointer-events-none"
              style={{ left: `${(x / 400) * 100}%`, top: `${(y / 200) * 100}%` }}
            >
              {/* Outer Pulse */}
              <div
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: color }}
              />
              {/* Inner Dot */}
              <div
                className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                style={{ backgroundColor: color }}
              />
              {/* Label */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-white/20 text-[8px] font-mono text-white animate-bounce">
                {m.type} @ {m.country}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
        <span>Lng: -180.00</span>
        <span>Equator</span>
        <span>Lng: +180.00</span>
      </div>
    </div>
  );
}
