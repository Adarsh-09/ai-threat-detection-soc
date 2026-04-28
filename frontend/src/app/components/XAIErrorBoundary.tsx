import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class XAIErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mt-4 px-4 py-3 rounded-lg font-mono text-xs"
          style={{
            background: "rgba(226,75,74,0.08)",
            border: "1px solid rgba(226,75,74,0.25)",
            color: "rgba(255,100,100,0.7)",
          }}
        >
          ⚠ XAI rendering error — raw prediction data is still valid.
        </div>
      );
    }
    return this.props.children;
  }
}
