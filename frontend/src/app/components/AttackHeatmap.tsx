import { useEffect, useState } from 'react';
import { getHeatmapData } from '../../api/threatApi';

const PROTOCOLS = ['TCP', 'UDP', 'ICMP'];
const SERVICES = ['HTTP', 'FTP', 'SMTP', 'SSH', 'DNS', 'Other'];

const ATTACK_COLOR_MAP: Record<string, string> = {
  Normal: '#10b981', DoS: '#ef4444', Probe: '#eab308', R2L: '#f97316', U2R: '#a855f7',
};

export function AttackHeatmap() {
  const [data, setData] = useState<Record<string, Record<string, number>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    getHeatmapData()
      .then(res => { if (res.success) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
        <h3 className="text-cyan-400 text-xs font-mono tracking-wider mb-3">ATTACK HEATMAP</h3>
        <div className="text-cyan-400 font-mono text-xs animate-pulse text-center py-8">⟳ LOADING HEATMAP DATA...</div>
      </div>
    );
  }

  if (!data) return null;

  const getCellData = (proto: string, svc: string) => {
    const key = `${proto}_${svc}`;
    const counts = data[key];
    if (!counts) return { total: 0, dominant: 'Normal', counts: {} };
    let dominant = 'Normal';
    let maxCount = 0;
    let total = 0;
    for (const [cat, cnt] of Object.entries(counts)) {
      total += cnt;
      if (cnt > maxCount) { maxCount = cnt; dominant = cat; }
    }
    return { total, dominant, counts };
  };

  const allTotals = PROTOCOLS.flatMap(p => SERVICES.map(s => getCellData(p, s).total));
  const maxTotal = Math.max(...allTotals, 1);

  return (
    <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel relative">
      <h3 className="text-cyan-400 text-xs font-mono tracking-wider mb-4">
        ◈ PROTOCOL × SERVICE ATTACK HEATMAP
      </h3>
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-xs font-mono text-gray-500 p-1 w-16" />
              {SERVICES.map(s => (
                <th key={s} className="text-xs font-mono text-gray-400 p-1 text-center">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROTOCOLS.map(proto => (
              <tr key={proto}>
                <td className="text-xs font-mono text-gray-400 p-1 text-right pr-3">{proto}</td>
                {SERVICES.map(svc => {
                  const cell = getCellData(proto, svc);
                  const intensity = cell.total / maxTotal;
                  const color = ATTACK_COLOR_MAP[cell.dominant] || '#10b981';
                  return (
                    <td key={svc} className="p-1">
                      <div
                        className="aspect-square rounded flex items-center justify-center cursor-pointer transition-all hover:scale-110 relative"
                        style={{
                          backgroundColor: `${color}${Math.round(intensity * 0.6 * 255).toString(16).padStart(2, '0')}`,
                          border: `1px solid ${color}${Math.round(intensity * 0.4 * 255 + 30).toString(16).padStart(2, '0')}`,
                          minHeight: 40,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const breakdown = Object.entries(cell.counts).map(([k, v]) => `${k}: ${v}`).join(', ');
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                            content: `${proto} × ${svc}\nDominant: ${cell.dominant}\nTotal: ${cell.total}\n${breakdown}`,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <span className="text-xs font-mono font-bold" style={{ color: intensity > 0.3 ? '#fff' : '#9ca3af' }}>
                          {cell.total > 0 ? cell.dominant.charAt(0) : '—'}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-3 text-xs font-mono flex-wrap">
        {Object.entries(ATTACK_COLOR_MAP).map(([name, color]) => (
          <span key={name} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-gray-400">{name}</span>
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 border border-cyan-500/50 rounded px-3 py-2 text-xs font-mono text-gray-300 whitespace-pre-line pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
