import { useEffect, useRef } from 'react';

type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export function useAudioAlert(threatLevel: ThreatLevel) {
  const prevLevel = useRef<ThreatLevel>(threatLevel);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const prev = prevLevel.current;
    prevLevel.current = threatLevel;

    // Only alert on escalation
    const escalated =
      (prev === 'LOW' && threatLevel === 'MEDIUM') ||
      (prev === 'LOW' && threatLevel === 'HIGH') ||
      (prev === 'MEDIUM' && threatLevel === 'HIGH');

    if (!escalated) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      const isHigh = threatLevel === 'HIGH';
      const baseFreq = isHigh ? 600 : 440;
      const duration = isHigh ? 0.6 : 0.4;
      const steps = isHigh ? 4 : 3;

      for (let i = 0; i < steps; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = isHigh ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(baseFreq + i * (isHigh ? 150 : 80), ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + duration);

        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + duration);
      }
    } catch (e) {
      // Audio not available — silent fail
    }
  }, [threatLevel]);
}
