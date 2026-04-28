import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { ShapValue } from '../../api/threatApi';

interface ShapWaterfallProps {
  shapValues: ShapValue[];
}

export function ShapWaterfall({ shapValues }: ShapWaterfallProps) {
  if (!shapValues || shapValues.length === 0) return null;

  // Take top 12, sorted by absolute value (already sorted from backend)
  const top = shapValues.slice(0, 12);
  const maxAbs = Math.max(...top.map(v => Math.abs(v.value)), 0.01);

  const data = top.map(sv => ({
    feature: sv.feature.replace(/_/g, ' ').replace('dst host ', 'dst_host_'),
    value: sv.value,
    absValue: Math.abs(sv.value),
    pct: ((sv.value / maxAbs) * 100).toFixed(1),
    positive: sv.value >= 0,
  }));

  return (
    <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4">
      <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">
        SHAP FEATURE CONTRIBUTIONS — PER-PREDICTION EXPLAINABILITY
      </h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 28 + 30)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 50, top: 5, bottom: 5 }}>
          <XAxis
            type="number"
            stroke="#06b6d4"
            fontSize={9}
            tickFormatter={(v: number) => v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
          />
          <YAxis
            dataKey="feature"
            type="category"
            stroke="#06b6d4"
            fontSize={9}
            width={110}
            tick={{ fill: '#9ca3af', fontFamily: 'monospace' }}
          />
          <ReferenceLine x={0} stroke="#374151" strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#000',
              border: '1px solid #06b6d4',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
            formatter={(value: number) => [
              `${value > 0 ? '+' : ''}${value.toFixed(4)}`,
              'SHAP Value',
            ]}
            labelStyle={{ color: '#06b6d4' }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.positive ? '#ef4444' : '#3b82f6'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2 text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          <span className="text-gray-400">Increases Risk</span>
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-500 rounded-sm" />
          <span className="text-gray-400">Decreases Risk</span>
        </span>
      </div>
    </div>
  );
}
