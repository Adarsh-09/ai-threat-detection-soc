import { useRef, useEffect } from 'react';
import type { PredictionHistoryEntry } from '../../api/threatApi';

interface PredictionHistoryProps {
  entries: PredictionHistoryEntry[];
  onClear: () => void;
}

function exportCSV(entries: PredictionHistoryEntry[]) {
  const headers = ['Timestamp', 'Protocol', 'Service', 'Flag', 'Threat Level', 'Attack Type', 'Confidence %', 'Anomalous'];
  const rows = entries.map(e => [
    e.timestamp, e.protocol, e.service, e.flag,
    e.threatLevel, e.attackType, e.confidence.toFixed(1), e.isAnomalous ? 'YES' : 'NO',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `threat_predictions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ROW_COLORS: Record<string, string> = {
  HIGH: 'bg-red-500/10 border-l-2 border-l-red-500',
  MEDIUM: 'bg-yellow-500/8 border-l-2 border-l-yellow-500',
  LOW: 'border-l-2 border-l-green-500/50',
};

export function PredictionHistory({ entries, onClear }: PredictionHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <div className="mt-6 bg-black/50 border border-cyan-500/30 rounded-lg p-5 threat-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-cyan-400 text-xs font-mono tracking-widest">
          ◈ PREDICTION HISTORY LOG — {entries.length} ENTRIES
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(entries)}
            className="px-3 py-1 text-xs font-mono border border-cyan-500/50 text-cyan-400 rounded hover:bg-cyan-500/20 transition-all"
          >
            ⬇ EXPORT CSV
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1 text-xs font-mono border border-red-500/50 text-red-400 rounded hover:bg-red-500/20 transition-all"
          >
            ✕ CLEAR LOG
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-72 rounded border border-gray-800">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-gray-900/95 z-10">
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left p-2 tracking-wider">#</th>
              <th className="text-left p-2 tracking-wider">TIMESTAMP</th>
              <th className="text-left p-2 tracking-wider">PROTO</th>
              <th className="text-left p-2 tracking-wider">SERVICE</th>
              <th className="text-left p-2 tracking-wider">FLAG</th>
              <th className="text-left p-2 tracking-wider">THREAT</th>
              <th className="text-left p-2 tracking-wider">ATTACK</th>
              <th className="text-right p-2 tracking-wider">CONF %</th>
              <th className="text-center p-2 tracking-wider">ANOM</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id} className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${ROW_COLORS[e.threatLevel] || ''}`}>
                <td className="p-2 text-gray-500">{i + 1}</td>
                <td className="p-2 text-gray-300">{e.timestamp}</td>
                <td className="p-2 text-cyan-300">{e.protocol}</td>
                <td className="p-2 text-cyan-300">{e.service}</td>
                <td className="p-2 text-cyan-300">{e.flag}</td>
                <td className="p-2">
                  <span className={`font-bold ${e.threatLevel === 'HIGH' ? 'text-red-400' : e.threatLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {e.threatLevel}
                  </span>
                </td>
                <td className="p-2">
                  <span className={
                    e.attackType === 'DoS' ? 'text-red-400' :
                    e.attackType === 'Probe' ? 'text-yellow-400' :
                    e.attackType === 'R2L' ? 'text-orange-400' :
                    e.attackType === 'U2R' ? 'text-purple-400' : 'text-green-400'
                  }>
                    {e.attackType}
                  </span>
                </td>
                <td className="p-2 text-right text-gray-300">{e.confidence.toFixed(1)}%</td>
                <td className="p-2 text-center">
                  {e.isAnomalous && <span className="text-purple-400 animate-pulse">⚠</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
