import React from 'react';
import { Link } from 'react-router-dom';

class GranularErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("GranularErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Check for specific error types if needed, or fallback logic
            const isAuthError = this.state.error?.message?.includes('Access Denied') || this.state.error?.message?.includes('401') || this.state.error?.message?.includes('403');
            const isNetworkError = this.state.error?.message?.includes('Network') || this.state.error?.message?.includes('Failed to fetch');

            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default Fancy Error UI
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-200 rounded-3xl shadow-sm m-4">
                    <div className={`h-20 w-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${isAuthError ? 'bg-red-100 text-red-500' : 'bg-slate-900 text-white'}`}>
                        <span className="material-symbols-outlined text-[40px]">
                            {isAuthError ? 'lock' : isNetworkError ? 'wifi_off' : 'bug_report'}
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        {isAuthError ? 'Access Denied' : isNetworkError ? 'Connection Lost' : 'System Glitch'}
                    </h2>

                    <p className="text-slate-500 max-w-md mb-8">
                        {isAuthError
                            ? "You do not have permission to view this area. Please contact your administrator."
                            : isNetworkError
                                ? "We lost contact with the server. Please check your internet connection."
                                : "The system encountered an unexpected error. Our engineers have been notified."}
                    </p>

                    <div className="bg-slate-100 p-4 rounded-xl text-left w-full max-w-lg mb-8 overflow-auto max-h-40 border border-slate-200">
                        <code className="text-xs font-mono text-red-500 block break-words">
                            {this.state.error?.toString()}
                        </code>
                        {this.state.errorInfo && (
                            <details className="mt-2 text-[10px] text-slate-400 font-mono cursor-pointer">
                                <summary>Stack Trace</summary>
                                <pre className="mt-2 whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={this.handleRetry}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                            Try Again
                        </button>
                        <Link
                            to="/"
                            className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Return Home
                        </Link>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GranularErrorBoundary;
