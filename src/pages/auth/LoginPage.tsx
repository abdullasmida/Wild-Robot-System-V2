import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loading, error: authError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!email || !password) {
            setLocalError('Please enter both email and password');
            return;
        }

        try {
            await login(email.trim(), password.trim());

            // Get proper role for redirection
            const user = useAuthStore.getState().user;
            const role = user?.role || 'owner'; // Default to owner if unsure

            if (role === 'athlete') {
                navigate('/athlete');
            } else if (role === 'coach' || role === 'head_coach') {
                navigate('/coach/dashboard');
            } else {
                // Owner and others
                navigate('/owner/dashboard');
            }
        } catch (err: any) {
            // Error is already set in store, but we can also handle it here if needed
            console.error("Login failed", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md space-y-8 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        Wild Robot
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Sign in to manage your academy
                    </p>
                </div>

                {(authError || localError) && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle size={16} />
                        <p>{localError || authError}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-emerald-500 hover:text-emerald-400">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-slate-900 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-emerald-500 hover:text-emerald-400">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
