import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ThreatResponse, AttackType } from '../../api/threatApi';
import { ShapWaterfall } from './ShapWaterfall';
import { XAIExplanationPanel } from './XAIExplanationPanel';
import { XAISkeleton } from './XAISkeleton';
import { XAIErrorBoundary } from './XAIErrorBoundary';

interface AnalyticsPanelProps {
  threatProbability: number;
  result: ThreatResponse | null;
  loading?: boolean;
}

const ATTACK_COLORS: Record<string, string> = {
  Normal: '#10b981',
  DoS:    '#ef4444',
  Probe:  '#eab308',
  R2L:    '#f97316',
  U2R:    '#a855f7',
};

export function AnalyticsPanel({ threatProbability, result, loading }: AnalyticsPanelProps) {
  const probs = result?.probabilities;
  const attackProbs = result?.attack_probabilities;
  const shapValues = result?.shap_values;
  const xai = result?.xai;

  // Threat level pie data
  const pieData = probs
    ? [
        { name: 'HIGH',   value: probs.HIGH   ?? 0 },
        { name: 'MEDIUM', value: probs.MEDIUM  ?? 0 },
        { name: 'LOW',    value: probs.LOW     ?? 0 },
      ]
    : [
        { name: 'Threat', value: threatProbability },
        { name: 'Safe',   value: 100 - threatProbability },
      ];

  const PIE_COLORS = probs ? ['#ef4444', '#eab308', '#10b981'] : ['#ef4444', '#10b981'];
  const confidence = result ? result.confidence : Math.min(95, threatProbability + 20);

  // Attack type pie data
  const attackPieData = attackProbs
    ? (['Normal', 'DoS', 'Probe', 'R2L', 'U2R'] as AttackType[])
        .map(cat => ({ name: cat, value: attackProbs[cat] ?? 0 }))
        .filter(d => d.value > 0.1)
    : null;

  const attackPieColors = attackPieData
    ? attackPieData.map(d => ATTACK_COLORS[d.name] || '#666')
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Threat level probability pie */}
        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
          <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">
            {probs ? 'THREAT LEVEL DISTRIBUTION' : 'THREAT PROBABILITY'}
          </h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#000', border: '1px solid #06b6d4', fontSize: 11 }}
                formatter={(v: number) => [`${v.toFixed(1)}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-1">
            {probs ? (
              <div className="flex justify-center gap-3 text-xs font-mono">
                <span className="text-red-400">H: {probs.HIGH?.toFixed(1)}%</span>
                <span className="text-yellow-400">M: {probs.MEDIUM?.toFixed(1)}%</span>
                <span className="text-green-400">L: {probs.LOW?.toFixed(1)}%</span>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-red-400">{threatProbability}%</span>
                <span className="text-gray-400 text-xs ml-2">RISK</span>
              </div>
            )}
          </div>
        </div>

        {/* Attack type distribution pie */}
        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
          {attackPieData ? (
            <>
              <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">ATTACK TYPE DISTRIBUTION</h3>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={attackPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {attackPieData.map((_, i) => <Cell key={i} fill={attackPieColors[i]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #06b6d4', fontSize: 11 }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-2 flex-wrap text-xs font-mono mt-1">
                {attackPieData.map(d => (
                  <span key={d.name} style={{ color: ATTACK_COLORS[d.name] }}>
                    {d.name}: {d.value.toFixed(1)}%
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">DETECTION CONFIDENCE</h3>
              <div className="flex items-center justify-center h-[170px]">
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-400 font-mono">{confidence.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400 font-mono mt-2">AWAITING PREDICTION</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* XAI Explanation Panel — "Why Was This Flagged?" */}
      {loading && <XAISkeleton />}
      {!loading && result?.xai && (
        <XAIErrorBoundary>
          <XAIExplanationPanel
            prediction={result.attack_type || 'Unknown'}
            confidence={result.confidence}
            severity={result.threat}
            xai={result.xai}
          />
        </XAIErrorBoundary>
      )}
      {!loading && result && !result.xai && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.07] text-xs text-white/35 font-mono">
          XAI explanation unavailable for this prediction — SHAP module may not be installed.
        </div>
      )}

      {/* Legacy SHAP Waterfall (kept for backward compatibility) */}
      {!result?.xai && shapValues && shapValues.length > 0 && (
        <ShapWaterfall shapValues={shapValues} />
      )}

      {/* Confidence bar */}
      <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
        <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">DETECTION CONFIDENCE</h3>
        <div className="relative h-7 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-1000 rounded-full"
            style={{ width: `${confidence}%` }}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400 font-mono">
          <span>0%</span>
          <span className="text-cyan-400 font-bold">{confidence.toFixed(1)}% CONFIDENCE</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

