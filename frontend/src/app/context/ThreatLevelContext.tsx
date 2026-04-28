import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH';
type AttackType = 'Normal' | 'DoS' | 'Probe' | 'R2L' | 'U2R';

interface ThreatLevelContextType {
  threatLevel: ThreatLevel;
  setThreatLevel: (level: ThreatLevel) => void;
  attackType: AttackType | null;
  setAttackType: (type: AttackType | null) => void;
  isZeroDay: boolean;
  setIsZeroDay: (val: boolean) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  haloColor: string;
  haloSpeed: string;
  haloOpacity: string;
}

const ThreatLevelContext = createContext<ThreatLevelContextType | null>(null);

const HALO_CONFIG = {
  LOW:      { color: '#00ff90', speed: '3s',   opacity: '0.19' },
  MEDIUM:   { color: '#ffaa00', speed: '1.5s', opacity: '0.25' },
  HIGH:     { color: '#ff0030', speed: '0.6s', opacity: '0.31' },
  ZERO_DAY: { color: '#cc00ff', speed: '0.5s', opacity: '0.25' },
};

export function ThreatLevelProvider({ children }: { children: ReactNode }) {
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('LOW');
  const [attackType, setAttackType]   = useState<AttackType | null>(null);
  const [isZeroDay, setIsZeroDay]     = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  const cfg = isZeroDay ? HALO_CONFIG.ZERO_DAY : HALO_CONFIG[threatLevel];

  // Update CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--halo-color', cfg.color);
    root.style.setProperty('--halo-speed', cfg.speed);
    root.style.setProperty('--halo-opacity', cfg.opacity);
  }, [cfg]);

  return (
    <ThreatLevelContext.Provider value={{
      threatLevel, setThreatLevel,
      attackType, setAttackType,
      isZeroDay, setIsZeroDay,
      confidenceThreshold, setConfidenceThreshold,
      haloColor: cfg.color,
      haloSpeed: cfg.speed,
      haloOpacity: cfg.opacity,
    }}>
      {children}
    </ThreatLevelContext.Provider>
  );
}

export function useThreatLevel() {
  const ctx = useContext(ThreatLevelContext);
  if (!ctx) throw new Error('useThreatLevel must be used within ThreatLevelProvider');
  return ctx;
}
