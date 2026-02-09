import React, { ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Error info:", errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h1 className="text-xl font-bold text-white">
                  Something went wrong
                </h1>
              </div>

              <p className="text-gray-300 mb-4 text-sm">
                {this.state.error?.message ||
                  "An unexpected error occurred. Please try again."}
              </p>

              {process.env.NODE_ENV === "development" && (
                <div className="mb-6 p-3 bg-slate-900 rounded border border-slate-600 text-xs text-gray-400 font-mono max-h-32 overflow-auto">
                  <p>Stack:</p>
                  <p className="mt-1">{this.state.error?.stack}</p>
                </div>
              )}

              <button
                onClick={this.resetError}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
