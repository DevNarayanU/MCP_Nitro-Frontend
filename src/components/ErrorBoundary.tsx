import React, { Component, type ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught UI Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-mono">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-lg w-full text-center space-y-6 shadow-2xl">
            <div className="w-12 h-12 bg-red-950 border border-red-800 text-red-500 rounded-xl flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-white uppercase tracking-wider">
                Application Interface Hiccup
              </h2>
              <p className="text-xs text-zinc-400 mt-2">
                {this.state.error?.message || "An unexpected rendering error occurred."}
              </p>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Compliance Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
