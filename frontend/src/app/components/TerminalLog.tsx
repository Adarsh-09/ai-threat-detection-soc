import { useState, useEffect, useRef } from 'react';

interface TerminalLogProps {
  threatLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  lastPrediction?: { threat: string; confidence: number; attack_type?: string; is_anomalous?: boolean } | null;
}

const BASE_MESSAGES = [
  '> Initializing surveillance protocols...',
  '> Scanning sector ALPHA-7... CLEAR',
  '> Sensor array: ONLINE',
  '> Cross-referencing threat database...',
  '> Biometric scan: AUTHORIZED',
  '> Perimeter breach check: NEGATIVE',
  '> Satellite uplink: ESTABLISHED',
  '> Neural network analysis: ACTIVE',
  '> Motion sensor grid: OPERATIONAL',
  '> Data stream analysis: CONTINUOUS',
  '> Predictive model: CALIBRATING',
  '> Encryption level: MAXIMUM',
];

const THREAT_MESSAGES: Record<string, string[]> = {
  HIGH: [
    '> ⚠ CRITICAL: HIGH THREAT DETECTED',
    '> Initiating emergency protocols...',
    '> Alerting response team...',
    '> Locking down affected sectors...',
    '> Threat classification: HOSTILE',
  ],
  MEDIUM: [
    '> WARNING: Anomalous activity detected',
    '> Flagging connection for review...',
    '> Threat classification: SUSPICIOUS',
    '> Monitoring elevated...',
  ],
  LOW: [
    '> Connection analyzed: NORMAL',
    '> Threat assessment: SAFE',
    '> All parameters within range',
    '> System status: SECURE',
  ],
};

export function TerminalLog({ threatLevel, lastPrediction }: TerminalLogProps) {
  const [logs, setLogs] = useState<{ msg: string; type: 'normal' | 'warning' | 'danger' | 'success' | 'zeroday'; flash?: boolean }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto background logs — speed up on HIGH
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = BASE_MESSAGES[Math.floor(Math.random() * BASE_MESSAGES.length)];
      setLogs(prev => [...prev, { msg, type: 'normal' }].slice(-15));
    }, threatLevel === 'HIGH' ? 1200 : 2500);
    return () => clearInterval(interval);
  }, [threatLevel]);

  // Inject threat-specific logs on prediction
  useEffect(() => {
    if (!threatLevel || !lastPrediction) return;
    const msgs = THREAT_MESSAGES[threatLevel] ?? [];
    msgs.forEach((msg, i) => {
      setTimeout(() => {
        const type = threatLevel === 'HIGH' ? 'danger' : threatLevel === 'MEDIUM' ? 'warning' : 'success';
        setLogs(prev => [...prev, { msg, type, flash: threatLevel === 'HIGH' }].slice(-15));
      }, i * 300);
    });

    // Attack type line
    if (lastPrediction.attack_type && lastPrediction.attack_type !== 'Normal') {
      setTimeout(() => {
        setLogs(prev => [...prev, {
          msg: `> Attack classification: ${lastPrediction.attack_type?.toUpperCase()}`,
          type: 'danger',
          flash: true,
        }].slice(-15));
      }, msgs.length * 300);
    }

    // Zero-day line
    if (lastPrediction.is_anomalous && lastPrediction.attack_type === 'Normal') {
      setTimeout(() => {
        setLogs(prev => [...prev, {
          msg: '> ⚠ ZERO-DAY ALERT: Anomalous pattern outside known signatures',
          type: 'zeroday',
          flash: true,
        }].slice(-15));
      }, msgs.length * 300 + 300);
    }

    // Confidence line
    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        { msg: `> Model confidence: ${lastPrediction.confidence.toFixed(1)}%`, type: 'normal' }
      ].slice(-15));
    }, msgs.length * 300 + 600);
  }, [lastPrediction, threatLevel]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const colorMap = {
    normal:  'text-green-400',
    warning: 'text-yellow-400',
    danger:  'text-red-400',
    success: 'text-green-300',
    zeroday: 'text-purple-400',
  };

  return (
    <div ref={containerRef} className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 h-64 overflow-auto font-mono text-xs threat-panel">
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`${colorMap[log.type]} ${log.flash ? 'animate-pulse font-bold' : ''} animate-[fadeIn_0.3s_ease-in]`}
          >
            {log.msg}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center">
        <span className="text-cyan-400">&gt;</span>
        <span className="ml-2 w-2 h-4 bg-cyan-400 animate-pulse inline-block" />
      </div>
    </div>
  );
}
