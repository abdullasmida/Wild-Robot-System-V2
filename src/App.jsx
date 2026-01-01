import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// ----------------------------------------------------------------------
// 1. Imports
// ----------------------------------------------------------------------

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import MobileLogin from './pages/auth/MobileLogin';
import Pricing from './pages/auth/Pricing';
import FakeCheckout from './pages/auth/FakeCheckout';
import AuthCallback from './pages/auth/AuthCallback';
import SetupAccount from './pages/auth/SetupAccount';

// Layouts
import OwnerLayout from './layouts/OwnerLayout';
import AthleteLayout from './layouts/StudentLayout';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AcademySetup from './pages/owner/AcademySetup';
import StaffRoster from './pages/owner/StaffRoster';
import AthletesRoster from './pages/owner/AthletesRoster';

// Athlete Pages
import AthleteHome from './pages/Athlete/AthleteHome';
import Achievements from './pages/Athlete/Achievements';

// Lazy Loading
const AthleteBilling = React.lazy(() => import('./pages/Athlete/Billing'));
const AthleteSettings = React.lazy(() => import('./pages/Athlete/Settings'));

// Shared
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import SecurityCheckpointPage from './components/SecurityCheckpoint';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import AuthGuard from './components/AuthGuard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <CommandPalette />
                <Toaster position="top-center" richColors />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/athlete/login" element={<Navigate to="/login" replace />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/checkout" element={<FakeCheckout />} />
                    <Route path="/security-checkpoint" element={<SecurityCheckpointPage />} />

                    {/* Authentication Flow */}
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/setup-account" element={<SetupAccount />} />

                    {/* -----------------------------------------------------------------
                        🛡️ OWNER SETUP ZONE
                        Special Route: Allows access even if setup is incomplete.
                        Prop: allowSetup={true}
                    ----------------------------------------------------------------- */}
                    <Route element={<ProtectedRoute allowSetup={true} />}>
                        <Route path="/setup" element={<AcademySetup />} />
                    </Route>

                    {/* -----------------------------------------------------------------
                        🏰 OWNER KINGDOM
                        Standard Protection: Requires Setup to be complete.
                        Guard will redirect to /setup if not done.
                        Switching to /owner layout immediately.
                    ----------------------------------------------------------------- */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/owner" element={<OwnerLayout />}>
                            <Route index element={<Navigate to="/owner/dashboard" replace />} />
                            <Route path="dashboard" element={<OwnerDashboard />} />

                            {/* Modules */}
                            <Route path="academy" element={<div className="p-10 font-bold text-slate-400 text-center">Academy Management</div>} />
                            <Route path="staff" element={<StaffRoster />} />
                            <Route path="finance" element={<div className="p-10 font-bold text-slate-400 text-center">Treasury & Finance</div>} />
                            <Route path="athletes" element={<AthletesRoster />} />
                            <Route path="schedule" element={<div className="p-10 font-bold text-slate-400 text-center">Class Schedule</div>} />
                            <Route path="settings" element={<div className="p-10 font-bold text-slate-400 text-center">System Settings</div>} />
                        </Route>
                    </Route>

                    {/* COACH ZONE - Placeholder */}
                    <Route path="/coach" element={<ProtectedRoute />}>
                        <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
                    </Route>

                    {/* 🔄 Legacy Redirects */}
                    <Route path="/student/*" element={<Navigate to="/athlete" replace />} />

                    {/* 🏅 ATHLETE DASHBOARD */}
                    <Route path="/athlete" element={
                        <AuthGuard>
                            <AthleteLayout />
                        </AuthGuard>
                    }>
                        <Route index element={<AthleteHome />} />
                        <Route path="achievements" element={<Achievements />} />

                        <Route path="billing" element={
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <AthleteBilling />
                            </React.Suspense>
                        } />

                        <Route path="settings" element={
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <AthleteSettings />
                            </React.Suspense>
                        } />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;