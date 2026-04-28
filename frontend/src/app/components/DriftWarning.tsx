import { useState, useEffect } from 'react';

export function DriftWarning() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const flag = localStorage.getItem('driftWarningDismissed');
    setDismissed(flag === 'true');
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('driftWarningDismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="mb-4 p-3 bg-amber-900/30 border border-amber-500/50 rounded-lg flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
        <span className="text-lg">⚠</span>
        <span>
          Model trained on NSL-KDD 2009 data — accuracy may degrade on modern attack patterns.
          Consider retraining on CICIDS-2017 or UNSW-NB15.
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 px-3 py-1 text-xs font-mono text-amber-400 border border-amber-500/50 rounded hover:bg-amber-500/20 transition-all"
      >
        DISMISS
      </button>
    </div>
  );
}
