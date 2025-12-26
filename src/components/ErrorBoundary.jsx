import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
                        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            We encountered an unexpected error. Don't worry, no data was lost.
                        </p>

                        {/* Dev Details (Optional - helpful for beta) */}
                        <div className="bg-slate-900 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32 text-xs font-mono text-red-300">
                            {this.state.error && this.state.error.toString()}
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">refresh</span>
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
