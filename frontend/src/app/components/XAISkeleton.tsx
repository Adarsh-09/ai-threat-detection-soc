import { motion } from "framer-motion";

export function XAISkeleton() {
  const pulse = {
    animate: { opacity: [0.3, 0.7, 0.3] as number[] },
    transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" as const },
  };
  return (
    <div className="bg-black/60 border border-cyan-500/20 rounded-xl p-5 mt-4">
      {/* Header skeleton */}
      <motion.div {...pulse}
        className="h-5 w-[40%] rounded-md bg-white/[0.07] mb-4" />

      {/* Reason card skeletons */}
      {[92, 78, 61].map((w, i) => (
        <motion.div key={i}
          animate={pulse.animate}
          transition={{ ...pulse.transition, delay: i * 0.15 }}
          className="rounded-lg bg-white/[0.05] mb-2"
          style={{ height: 52, width: `${w}%` }} />
      ))}

      {/* Chart skeleton */}
      <motion.div {...pulse}
        className="h-[280px] rounded-lg bg-white/[0.04] mt-4" />

      {/* Label */}
      <div className="text-center mt-3">
        <span className="text-[10px] text-white/20 font-mono tracking-wider animate-pulse">
          Computing SHAP explanations...
        </span>
      </div>
    </div>
  );
}
