import { useState, useRef, useCallback } from 'react';
import { getSampleConnections, predictThreat, type ThreatInput, type ThreatResponse, type PredictionHistoryEntry } from '../../api/threatApi';

interface SimulationRunnerProps {
  onPrediction: (result: ThreatResponse, input: ThreatInput) => void;
  disabled?: boolean;
}

const PROTO_REV: Record<number, string> = { 2: 'TCP', 1: 'UDP', 0: 'ICMP' };
const SVC_REV: Record<number, string> = { 10: 'HTTP', 4: 'FTP', 18: 'SMTP', 20: 'SSH', 3: 'DNS', 0: 'Other' };
const FLAG_REV: Record<number, string> = { 5: 'SF', 4: 'S0', 3: 'REJ', 2: 'RSTO', 1: 'SH', 0: 'Other' };

export function SimulationRunner({ onPrediction, disabled }: SimulationRunnerProps) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{ threats: number; types: Set<string> } | null>(null);
  const abortRef = useRef(false);

  const runSimulation = useCallback(async () => {
    setRunning(true);
    setSummary(null);
    abortRef.current = false;
    setProgress(0);

    try {
      const res = await getSampleConnections();
      if (!res.success || !res.data) {
        setRunning(false);
        return;
      }

      const connections = res.data.slice(0, 20);
      setTotal(connections.length);
      let threats = 0;
      const attackTypes = new Set<string>();

      for (let i = 0; i < connections.length; i++) {
        if (abortRef.current) break;

        const conn = connections[i] as any;
        const input: ThreatInput = {
          duration: conn.duration ?? 0,
          protocol_type: conn.protocol_type ?? 0,
          service: conn.service ?? 0,
          flag: conn.flag ?? 0,
          src_bytes: conn.src_bytes ?? 0,
          dst_bytes: conn.dst_bytes ?? 0,
          land: conn.land ?? 0,
          wrong_fragment: conn.wrong_fragment ?? 0,
          urgent: conn.urgent ?? 0,
          hot: conn.hot ?? 0,
          num_failed_logins: conn.num_failed_logins ?? 0,
          logged_in: conn.logged_in ?? 0,
          num_compromised: conn.num_compromised ?? 0,
          root_shell: conn.root_shell ?? 0,
          su_attempted: conn.su_attempted ?? 0,
          num_root: conn.num_root ?? 0,
          num_file_creations: conn.num_file_creations ?? 0,
          num_shells: conn.num_shells ?? 0,
          num_access_files: conn.num_access_files ?? 0,
          num_outbound_cmds: conn.num_outbound_cmds ?? 0,
          is_host_login: conn.is_host_login ?? 0,
          is_guest_login: conn.is_guest_login ?? 0,
          count: conn.count ?? 1,
          srv_count: conn.srv_count ?? 1,
          serror_rate: conn.serror_rate ?? 0,
          srv_serror_rate: conn.srv_serror_rate ?? 0,
          rerror_rate: conn.rerror_rate ?? 0,
          srv_rerror_rate: conn.srv_rerror_rate ?? 0,
          same_srv_rate: conn.same_srv_rate ?? 1,
          diff_srv_rate: conn.diff_srv_rate ?? 0,
          srv_diff_host_rate: conn.srv_diff_host_rate ?? 0,
          dst_host_count: conn.dst_host_count ?? 1,
          dst_host_srv_count: conn.dst_host_srv_count ?? 1,
          dst_host_same_srv_rate: conn.dst_host_same_srv_rate ?? 1,
          dst_host_diff_srv_rate: conn.dst_host_diff_srv_rate ?? 0,
          dst_host_same_src_port_rate: conn.dst_host_same_src_port_rate ?? 1,
          dst_host_srv_diff_host_rate: conn.dst_host_srv_diff_host_rate ?? 0,
          dst_host_serror_rate: conn.dst_host_serror_rate ?? 0,
          dst_host_srv_serror_rate: conn.dst_host_srv_serror_rate ?? 0,
          dst_host_rerror_rate: conn.dst_host_rerror_rate ?? 0,
          dst_host_srv_rerror_rate: conn.dst_host_srv_rerror_rate ?? 0,
        };

        try {
          const result = await predictThreat(input);
          onPrediction(result, input);
          if (result.threat !== 'LOW') threats++;
          if (result.attack_type) attackTypes.add(result.attack_type);
        } catch (e) {
          console.error('Simulation prediction error:', e);
        }

        setProgress(i + 1);
        // 1.2s delay
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      setSummary({ threats, types: attackTypes });
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setRunning(false);
    }
  }, [onPrediction]);

  const stopSimulation = () => {
    abortRef.current = true;
  };

  return (
    <>
      {!running && !summary && (
        <button
          onClick={runSimulation}
          disabled={disabled}
          className="px-4 py-2 text-xs font-mono bg-green-500/20 border border-green-500/50 text-green-400 rounded hover:bg-green-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          ▶ RUN SIMULATION
        </button>
      )}

      {running && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-cyan-400">SIMULATING... {progress}/{total}</span>
              <span className="text-gray-400">{total > 0 ? Math.round((progress / total) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <button onClick={stopSimulation} className="px-3 py-1 text-xs font-mono border border-red-500/50 text-red-400 rounded hover:bg-red-500/20">
            ■ STOP
          </button>
        </div>
      )}

      {/* Summary popup */}
      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSummary(null)}>
          <div className="bg-gray-900 border border-green-500/40 rounded-lg p-6 max-w-md w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-green-400 font-mono text-lg tracking-wider mb-3">SIMULATION COMPLETE</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="text-gray-300">
                <span className="text-red-400 font-bold">{summary.threats}</span> threats detected across{' '}
                <span className="text-cyan-400 font-bold">{summary.types.size}</span> attack types
              </div>
              <div className="text-gray-400 text-xs">
                Types: {Array.from(summary.types).join(', ') || 'None'}
              </div>
            </div>
            <button
              onClick={() => setSummary(null)}
              className="mt-4 px-6 py-2 text-xs font-mono bg-green-500/20 border border-green-500/50 text-green-400 rounded hover:bg-green-500/30 transition-all"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}
    </>
  );
}
