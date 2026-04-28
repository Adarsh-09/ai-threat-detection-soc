import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { batchPredict, type BatchResult } from '../../api/threatApi';
import { AttackTimeline } from './AttackTimeline';

const ATTACK_COLORS: Record<string, string> = {
  Normal: '#10b981', DoS: '#ef4444', Probe: '#eab308', R2L: '#f97316', U2R: '#a855f7', Unknown: '#6b7280',
};

function exportBatchCSV(results: BatchResult[]) {
  const headers = ['Index', 'Threat', 'Attack Type', 'Confidence', 'Anomalous', 'Anomaly Score'];
  const rows = results.map(r => [r.index, r.threat, r.attack_type, r.confidence, r.is_anomalous ? 'YES' : 'NO', r.anomaly_score ?? '']);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `batch_results_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export function BatchAnalysis() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResult[] | null>(null);
  const [attackBreakdown, setAttackBreakdown] = useState<Record<string, number> | null>(null);
  const [threatBreakdown, setThreatBreakdown] = useState<Record<string, number> | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await batchPredict(file);
      if (res.success && res.data) {
        setResults(res.data.results);
        setAttackBreakdown(res.data.attack_breakdown);
        setThreatBreakdown(res.data.threat_breakdown);
        setTotal(res.data.total);
      } else {
        setError(res.error || 'Batch prediction failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) handleFile(file);
    else setError('Please upload a .csv file');
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const donutData = attackBreakdown
    ? Object.entries(attackBreakdown).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
    : [];

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      {!results && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            dragOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600 hover:border-cyan-500/50'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('batch-file-input')?.click()}
        >
          <input id="batch-file-input" type="file" accept=".csv,.txt" className="hidden" onChange={onFileSelect} />
          {loading ? (
            <div className="space-y-3">
              <div className="text-cyan-400 font-mono text-sm animate-pulse">⟳ PROCESSING BATCH...</div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full bg-cyan-400 animate-pulse w-full" />
              </div>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-3">📂</div>
              <div className="text-cyan-400 font-mono text-sm tracking-wider">DROP CSV FILE HERE OR CLICK TO UPLOAD</div>
              <div className="text-gray-500 font-mono text-xs mt-2">Supports NSL-KDD format CSV files</div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 font-mono text-xs">⚠ {error}</div>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400 font-mono">{total}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">TOTAL CONNECTIONS</div>
            </div>
            <div className="bg-black/50 border border-red-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400 font-mono">{threatBreakdown?.HIGH || 0}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">HIGH THREATS</div>
            </div>
            <div className="bg-black/50 border border-yellow-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 font-mono">{threatBreakdown?.MEDIUM || 0}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">MEDIUM THREATS</div>
            </div>
            <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 font-mono">{threatBreakdown?.LOW || 0}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">LOW / NORMAL</div>
            </div>
          </div>

          {/* Donut chart + breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4">
              <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">ATTACK TYPE DISTRIBUTION</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {donutData.map((d, i) => <Cell key={i} fill={ATTACK_COLORS[d.name] || '#666'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #06b6d4', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 flex-wrap text-xs font-mono mt-2">
                {donutData.map(d => (
                  <span key={d.name} style={{ color: ATTACK_COLORS[d.name] }}>{d.name}: {d.value}</span>
                ))}
              </div>
            </div>
            <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4">
              <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">ATTACK BREAKDOWN</h3>
              <div className="space-y-2">
                {donutData.map(d => {
                  const pct = total > 0 ? (d.value / total * 100) : 0;
                  return (
                    <div key={d.name}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span style={{ color: ATTACK_COLORS[d.name] }}>{d.name}</span>
                        <span className="text-gray-400">{d.value} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: ATTACK_COLORS[d.name] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <AttackTimeline results={results} />

          {/* Results table */}
          <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-cyan-400 text-xs font-mono tracking-wider">PER-ROW RESULTS</h3>
              <div className="flex gap-2">
                <button onClick={() => exportBatchCSV(results)} className="px-3 py-1 text-xs font-mono border border-cyan-500/50 text-cyan-400 rounded hover:bg-cyan-500/20 transition-all">
                  ⬇ EXPORT CSV
                </button>
                <button onClick={() => { setResults(null); setAttackBreakdown(null); }} className="px-3 py-1 text-xs font-mono border border-gray-600 text-gray-400 rounded hover:bg-gray-700/50 transition-all">
                  ✕ NEW BATCH
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-64 rounded border border-gray-800">
              <table className="w-full text-xs font-mono">
                <thead className="sticky top-0 bg-gray-900/95">
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">THREAT</th>
                    <th className="text-left p-2">ATTACK</th>
                    <th className="text-right p-2">CONF %</th>
                    <th className="text-center p-2">ANOM</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 200).map((r) => (
                    <tr key={r.index} className={`border-b border-gray-800/50 ${r.threat === 'HIGH' ? 'bg-red-500/10' : r.threat === 'MEDIUM' ? 'bg-yellow-500/5' : ''}`}>
                      <td className="p-2 text-gray-500">{r.index + 1}</td>
                      <td className="p-2"><span className={`font-bold ${r.threat === 'HIGH' ? 'text-red-400' : r.threat === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>{r.threat}</span></td>
                      <td className="p-2" style={{ color: ATTACK_COLORS[r.attack_type] || '#9ca3af' }}>{r.attack_type}</td>
                      <td className="p-2 text-right text-gray-300">{r.confidence.toFixed(1)}%</td>
                      <td className="p-2 text-center">{r.is_anomalous && <span className="text-purple-400">⚠</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
