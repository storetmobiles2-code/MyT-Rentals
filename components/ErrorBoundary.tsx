import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6 text-sm">
              We encountered an unexpected error. The application has been stopped to prevent data loss.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold shadow-lg shadow-primary-600/30"
            >
              Reload Application
            </button>
             {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 text-left">
                    <p className="text-xs font-mono text-gray-400 mb-1">Error Details:</p>
                    <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-rose-600 overflow-auto max-h-40 font-mono">
                      {this.state.error?.toString()}
                    </pre>
                </div>
             )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;