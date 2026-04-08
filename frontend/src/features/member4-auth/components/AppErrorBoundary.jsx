import React from "react";

/**
 * AppErrorBoundary – prevents the whole React tree from crashing
 * if a route element/import becomes invalid.
 */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Intentionally no console spam; keep UI stable.
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
          <p className="mt-1 text-sm text-slate-600">
            The page crashed unexpectedly. Please refresh.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Refresh
            </button>
            <a
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go to login
            </a>
          </div>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

