import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  Cell, ResponsiveContainer
} from "recharts";
import type { XAIPayload } from "../../api/threatApi";

interface XAIExplanationPanelProps {
  prediction: string;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  xai: XAIPayload;
}

const CLASS_COLORS: Record<string, string> = {
  DoS:      "#E24B4A",
  Probe:    "#378ADD",
  R2L:      "#EF9F27",
  U2R:      "#a855f7",
  Normal:   "#1D9E75",
  "Zero-Day": "#7F77DD",
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW:      "#1D9E75",
  MEDIUM:   "#EF9F27",
  HIGH:     "#E24B4A",
};

const RISK_COLOR = "#E24B4A";
const SAFE_COLOR = "#1D9E75";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ShapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "rgba(8,12,24,0.95)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: "rgba(255,255,255,0.85)"
    }}>
      <p style={{ marginBottom: 4, color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
        {d.payload.name}
      </p>
      <p>
        SHAP:{" "}
        <span style={{ color: d.value >= 0 ? RISK_COLOR : SAFE_COLOR, fontWeight: 600 }}>
          {d.value >= 0 ? "+" : ""}{d.value.toFixed(4)}
        </span>
      </p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>
        Raw value: {d.payload.rawValue?.toLocaleString() ?? "—"}
      </p>
    </div>
  );
}

export function XAIExplanationPanel({
  prediction, confidence, severity, xai
}: XAIExplanationPanelProps) {
  const [tableOpen, setTableOpen] = useState(false);
  const classColor = CLASS_COLORS[prediction] ?? "#7F77DD";
  const severityColor = SEVERITY_COLORS[severity] ?? "#EF9F27";

  const chartData = [...xai.top_contributions]
    .slice(0, 10)
    .map(c => ({
      name: c.feature.replace(/_/g, " "),
      value: c.shap_value,
      direction: c.direction,
      rawValue: c.raw_value,
    }))
    .reverse();

  const isNormal = prediction === "Normal";
  const headerText = isNormal
    ? "Why this traffic is considered normal"
    : "Why this traffic was flagged as a threat";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-black/60 border border-cyan-500/20 rounded-xl p-5 mt-4"
      style={{
        boxShadow: '0 0 30px rgba(0, 200, 255, 0.03)',
      }}
    >

      {/* ── Section A: Header ── */}
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.07] flex-wrap">
        <span
          className="text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase font-mono"
          style={{
            background: classColor + "22",
            color: classColor,
            border: `1px solid ${classColor}55`,
          }}
        >
          {prediction}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full tracking-wider font-mono"
          style={{
            background: "#7F77DD22",
            color: "#a99fff",
            border: "1px solid #7F77DD44",
          }}
        >
          XAI Active
        </span>
        <div className="ml-auto flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono">
            {confidence.toFixed(1)}%
          </span>
          <span className="text-xs text-white/30">confidence</span>
        </div>
        <span
          className="text-[11px] px-2.5 py-0.5 rounded-full font-mono"
          style={{
            background: severityColor + "18",
            color: severityColor,
            border: `1px solid ${severityColor}44`,
          }}
        >
          {severity}
        </span>
      </div>

      {/* ── Section B: Top 3 Reason Cards ── */}
      <p className="text-[10px] tracking-[0.12em] uppercase text-white/30 mb-3 font-mono">
        {headerText}
      </p>
      <div className="flex flex-col gap-2 mb-5">
        {xai.top3_reasons.map((reason, i) => {
          const contrib = xai.top_contributions[i];
          const isRisk = contrib?.direction === "increases_risk";
          const barColor = isRisk ? RISK_COLOR : SAFE_COLOR;
          const pct = contrib?.pct ?? 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.09, duration: 0.35 }}
              className="rounded-r-lg"
              style={{
                borderLeft: `3px solid ${barColor}`,
                background: "rgba(255,255,255,0.025)",
                padding: "10px 12px",
              }}
            >
              <span className="text-[10px] text-white/25 tracking-[0.1em] font-mono block mb-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[13px] leading-relaxed text-white/80">
                {reason}
              </p>
              <div className="h-[3px] bg-white/[0.07] rounded-sm overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3 + i * 0.09, duration: 0.55, ease: "easeOut" }}
                  className="h-full rounded-sm"
                  style={{ background: barColor }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Section C: SHAP Bar Chart ── */}
      <p className="text-[10px] tracking-[0.12em] uppercase text-white/30 mb-3 font-mono">
        Feature impact — SHAP values (top 10)
      </p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mb-5"
      >
        <ResponsiveContainer width="100%" height={310}>
          <BarChart data={chartData} layout="vertical"
            margin={{ left: 10, right: 50, top: 4, bottom: 4 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={{ fontSize: 10.5, fill: "rgba(255,255,255,0.5)" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)" />
            <Tooltip content={<ShapTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={20} label={{
              position: "right",
              fontSize: 10,
              fill: "rgba(255,255,255,0.3)",
              formatter: (v: number) => v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3)
            }}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.direction === "increases_risk" ? RISK_COLOR : SAFE_COLOR}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex gap-4 justify-center mt-1 text-[10px] text-white/35">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: RISK_COLOR }} />
            Increases risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: SAFE_COLOR }} />
            Decreases risk
          </span>
        </div>
      </motion.div>

      {/* ── Section D: Collapsible Feature Table ── */}
      <button
        onClick={() => setTableOpen(v => !v)}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 text-[11px] text-white/40 font-mono tracking-wider hover:bg-white/[0.06] hover:text-white/50 transition-all"
      >
        {tableOpen ? "Hide feature detail table ↑" : "Show full feature detail table ↓"}
      </button>

      <AnimatePresence>
        {tableOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <table className="w-full mt-3 text-[11px] font-mono" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Feature", "Raw Value", "SHAP Value", "Impact"].map(h => (
                    <th key={h} className="text-white/30 font-medium text-left px-2.5 py-1.5 border-b border-white/[0.06]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {xai.top_contributions.map((c, i) => {
                  const isRisk = c.direction === "increases_risk";
                  return (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="px-2.5 py-1.5 text-white/60">
                        {c.feature.replace(/_/g, " ")}
                      </td>
                      <td className="px-2.5 py-1.5 text-white/80">
                        {c.raw_value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-2.5 py-1.5" style={{ color: isRisk ? RISK_COLOR : SAFE_COLOR }}>
                        {c.shap_value >= 0 ? "+" : ""}{c.shap_value.toFixed(4)}
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            background: isRisk ? "#E24B4A22" : "#1D9E7522",
                            color: isRisk ? "#ff6b6b" : "#4ecca3",
                          }}
                        >
                          {isRisk ? "increases risk" : "decreases risk"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
