import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import type { BatchResult } from '../../api/threatApi';

interface AttackTimelineProps {
  results: BatchResult[];
}

const ATTACK_COLORS: Record<string, string> = {
  Normal: '#10b981', DoS: '#ef4444', Probe: '#eab308', R2L: '#f97316', U2R: '#a855f7',
};

export function AttackTimeline({ results }: AttackTimelineProps) {
  if (!results || results.length === 0) return null;

  const data = results.map(r => ({
    index: r.index + 1,
    probability: r.probability ?? r.confidence,
    attackType: r.attack_type,
    color: ATTACK_COLORS[r.attack_type] || '#6b7280',
  }));

  // Detect clusters: 3+ consecutive HIGH/attack entries
  const clusters: number[] = [];
  let streak = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].attackType !== 'Normal' && data[i].probability > 60) {
      streak++;
      if (streak === 3) clusters.push(i - 1); // mark middle of cluster
    } else {
      streak = 0;
    }
  }

  return (
    <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
      <h3 className="text-cyan-400 text-xs mb-3 font-mono tracking-wider">
        ATTACK TIMELINE — THREAT PROBABILITY OVER CONNECTIONS
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="index"
            stroke="#06b6d4"
            fontSize={9}
            label={{ value: 'Connection Index', position: 'insideBottomRight', offset: -5, fontSize: 9, fill: '#6b7280' }}
          />
          <YAxis
            stroke="#06b6d4"
            fontSize={9}
            domain={[0, 100]}
            label={{ value: 'Threat %', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#000', border: '1px solid #06b6d4', fontSize: 11, fontFamily: 'monospace' }}
            formatter={(value: number, _name: string, props: any) => [
              `${value.toFixed(1)}%`,
              props.payload.attackType,
            ]}
            labelFormatter={(label: number) => `Connection #${label}`}
          />
          {clusters.map((ci, i) => (
            <ReferenceLine
              key={i}
              x={data[ci]?.index}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: '⚠ CLUSTER', position: 'top', fontSize: 8, fill: '#ef4444' }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="probability"
            stroke="#06b6d4"
            strokeWidth={1.5}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              const color = ATTACK_COLORS[payload.attackType] || '#6b7280';
              return (
                <circle
                  key={payload.index}
                  cx={cx}
                  cy={cy}
                  r={payload.attackType !== 'Normal' ? 4 : 2}
                  fill={color}
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.85}
                />
              );
            }}
            activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-xs font-mono flex-wrap">
        {Object.entries(ATTACK_COLORS).map(([name, color]) => (
          <span key={name} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-gray-400">{name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
