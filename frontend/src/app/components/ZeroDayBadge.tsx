interface ZeroDayBadgeProps {
  isAnomalous: boolean;
  attackType: string;
  anomalyScore?: number;
}

export function ZeroDayBadge({ isAnomalous, attackType, anomalyScore }: ZeroDayBadgeProps) {
  // Only show when RF says Normal but IsolationForest says anomalous
  if (!isAnomalous || attackType !== 'Normal') return null;

  return (
    <div className="mt-4 p-4 rounded-lg border-2 border-purple-500/60 bg-purple-500/10 animate-pulse"
         style={{ boxShadow: '0 0 25px rgba(168, 85, 247, 0.3), inset 0 0 15px rgba(168, 85, 247, 0.05)' }}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠</span>
        <div>
          <div className="text-purple-300 font-mono font-bold text-sm tracking-wider">
            ZERO-DAY RISK — UNUSUAL PATTERN DETECTED
          </div>
          <div className="text-purple-400/70 font-mono text-xs mt-1">
            Pattern detected outside known attack signatures. Isolation Forest anomaly score: {anomalyScore?.toFixed(4) ?? 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
