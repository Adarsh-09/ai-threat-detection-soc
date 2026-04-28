import { useState } from "react";
import { predictThreat, ThreatInput, ThreatResponse } from "../api/threatApi";

export function useThreatPredict() {
  const [result, setResult] = useState<ThreatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (input: ThreatInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictThreat(input);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, predict };
}
