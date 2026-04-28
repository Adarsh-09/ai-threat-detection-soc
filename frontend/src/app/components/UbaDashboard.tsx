import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fetchUbaDashboard, simulateUbaScenario, UbaDashboardData } from '../../api/ubaApi';

export const UbaDashboard: React.FC = () => {
  const [data, setData] = useState<UbaDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      const result = await fetchUbaDashboard();
      setData(result);
    } catch (e) {
      console.error("Failed to load UBA data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (scenario: string) => {
    setSimulating(true);
    try {
      await simulateUbaScenario(scenario);
      await loadData();
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !data) {
    return <div className="text-cyan-400 font-mono text-center p-10">INITIALIZING UBA MODULE...</div>;
  }

  // Formatting data for charts
  const activityData = data?.recent_activities.slice(0, 15).reverse().map((a, i) => ({
    time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: a.score,
    isAnomalous: a.is_anomalous ? 1 : 0
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in duration-500">
      
      {/* Left Panel: Scenarios & Risks */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel shadow-[0_0_15px_rgba(0,212,255,0.1)]">
          <h3 className="text-cyan-400 text-xs mb-4 font-mono tracking-wider border-b border-cyan-500/30 pb-2">🎯 SIMULATE SCENARIOS</h3>
          <div className="space-y-2">
            <button disabled={simulating} onClick={() => handleSimulate('normal')} className="w-full text-left px-3 py-2 text-xs font-mono bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border border-blue-500/50 rounded transition-all">
              ▶ Normal Behavior
            </button>
            <button disabled={simulating} onClick={() => handleSimulate('3am_login')} className="w-full text-left px-3 py-2 text-xs font-mono bg-orange-900/30 hover:bg-orange-800/50 text-orange-300 border border-orange-500/50 rounded transition-all">
              ▶ 3 AM Login
            </button>
            <button disabled={simulating} onClick={() => handleSimulate('large_download')} className="w-full text-left px-3 py-2 text-xs font-mono bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-500/50 rounded transition-all">
              ▶ Massive Download
            </button>
            <button disabled={simulating} onClick={() => handleSimulate('new_country')} className="w-full text-left px-3 py-2 text-xs font-mono bg-yellow-900/30 hover:bg-yellow-800/50 text-yellow-300 border border-yellow-500/50 rounded transition-all">
              ▶ Unrecognized Location
            </button>
            <button disabled={simulating} onClick={() => handleSimulate('brute_force')} className="w-full text-left px-3 py-2 text-xs font-mono bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 border border-purple-500/50 rounded transition-all">
              ▶ Brute Force Attempt
            </button>
          </div>
        </div>

        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
          <h3 className="text-cyan-400 text-xs mb-4 font-mono tracking-wider border-b border-cyan-500/30 pb-2">⚠️ USER RISK PROFILES</h3>
          <div className="space-y-3">
            {data?.risk_scores.length === 0 ? (
              <div className="text-gray-500 text-xs font-mono">No high-risk users detected.</div>
            ) : (
              data?.risk_scores.map((risk, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700">
                  <span className="font-mono text-sm text-gray-300">{risk.user_id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${risk.level === 'High' ? 'text-red-400' : 'text-orange-400'}`}>
                      {risk.level}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{risk.score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Center Panel: Charts */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
          <h3 className="text-cyan-400 text-xs mb-4 font-mono tracking-wider border-b border-cyan-500/30 pb-2">📈 ANOMALY SCORE TREND</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickMargin={10} />
                <YAxis stroke="#4b5563" fontSize={10} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00d4ff', color: '#00d4ff' }} 
                  itemStyle={{ color: '#00ff88' }}
                />
                <Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2} dot={{ r: 4, fill: '#00d4ff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel">
          <h3 className="text-cyan-400 text-xs mb-4 font-mono tracking-wider border-b border-cyan-500/30 pb-2">📊 RECENT ACTIVITY LOG</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="pb-2">TIME</th>
                  <th className="pb-2">USER</th>
                  <th className="pb-2">ACTION</th>
                  <th className="pb-2">RISK</th>
                  <th className="pb-2">SCORE</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_activities.slice(0, 5).map((act) => (
                  <tr key={act.id} className={`border-b border-gray-800 ${act.is_anomalous ? 'bg-red-900/10' : ''}`}>
                    <td className="py-2 text-gray-400">{new Date(act.time).toLocaleTimeString()}</td>
                    <td className="py-2 text-cyan-300">{act.user_id}</td>
                    <td className="py-2 text-gray-300">{act.action}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-[10px] border ${act.risk_level === 'High' ? 'border-red-500 text-red-400 bg-red-900/20' : act.risk_level === 'Medium' ? 'border-orange-500 text-orange-400 bg-orange-900/20' : 'border-green-500 text-green-400 bg-green-900/20'}`}>
                        {act.risk_level}
                      </span>
                    </td>
                    <td className={`py-2 ${act.is_anomalous ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                      {act.score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Panel: Alerts */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 threat-panel h-full">
          <h3 className="text-cyan-400 text-xs mb-4 font-mono tracking-wider border-b border-cyan-500/30 pb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> 
            LIVE ALERTS
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {data?.alerts.length === 0 ? (
              <div className="text-gray-500 text-xs font-mono text-center mt-10">No recent anomalies detected.</div>
            ) : (
              data?.alerts.map((alert, idx) => (
                <div key={idx} className="border-l-2 border-red-500 bg-red-900/10 p-3 rounded-r relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-xl group-hover:bg-red-500/20 transition-all"></div>
                  <div className="text-[10px] text-red-400 font-mono mb-1">{new Date(alert.time).toLocaleTimeString()}</div>
                  <div className="text-sm text-gray-200 font-bold mb-1">{alert.action.toUpperCase()}</div>
                  <div className="text-xs text-gray-400 font-mono">User: <span className="text-cyan-300">{alert.user_id}</span></div>
                  <div className="text-xs text-gray-500 mt-1 font-mono">{alert.details}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
