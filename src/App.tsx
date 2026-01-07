import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// 1. Imports

// Auth
import LoginPage from './pages/auth/LoginPage';
import AcademyWizard from './pages/auth/AcademyWizard';
import Pricing from './pages/auth/Pricing';
import FakeCheckout from './pages/auth/FakeCheckout';
import AuthCallback from './pages/auth/AuthCallback';
import SetupAccount from './pages/auth/SetupAccount';

// Layouts
import OwnerLayout from './layouts/OwnerLayout';
import AthleteLayout from './layouts/StudentLayout';
import CoachLayout from './layouts/CoachLayout';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AcademySetup from './pages/owner/AcademySetup';
import StaffRoster from './pages/owner/StaffRoster';
import AthletesRoster from './pages/owner/AthletesRoster';
import OwnerProfile from './pages/owner/OwnerProfile';
import SchedulePage from './pages/SchedulePage';

// Athlete Pages
import AthleteHome from './pages/Athlete/AthleteHome';
import Achievements from './pages/Athlete/Achievements';

// Coach Pages
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachSchedule from './pages/coach/CoachSchedule';
import CoachRoster from './pages/coach/Roster';
import CoachProfile from './pages/coach/Profile';

// Lazy Loading
const AthleteBilling = React.lazy(() => import('./pages/Athlete/Billing'));
const AthleteSettings = React.lazy(() => import('./pages/Athlete/Settings'));

// Shared
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import SecurityCheckpointPage from './components/SecurityCheckpoint';
import ComingSoon from './components/ComingSoon';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import AuthGuard from './components/AuthGuard';
import ProtectedRoute from './components/ProtectedRoute';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

function App() {
    const checkSession = useAuthStore((state) => state.checkSession);

    useEffect(() => {
        checkSession();
    }, [checkSession]);
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <CommandPalette />
                <Toaster position="top-center" richColors />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<AcademyWizard />} />
                    <Route path="/athlete/login" element={<Navigate to="/login" replace />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/checkout" element={<FakeCheckout />} />
                    <Route path="/security-checkpoint" element={<SecurityCheckpointPage />} />

                    {/* Authentication Flow */}
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/setup-account" element={<SetupAccount />} />

                    {/* -----------------------------------------------------------------
                        🛡️ OWNER SETUP ZONE
                    ----------------------------------------------------------------- */}
                    <Route element={<ProtectedRoute allowSetup={true} />}>
                        <Route path="/setup" element={<AcademySetup />} />
                    </Route>

                    {/* -----------------------------------------------------------------
                        🏰 OWNER KINGDOM
                    ----------------------------------------------------------------- */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/owner" element={<OwnerLayout />}>
                            <Route index element={<Navigate to="/owner/dashboard" replace />} />
                            <Route path="dashboard" element={<OwnerDashboard />} />

                            {/* Modules */}
                            <Route path="academy" element={<ComingSoon title="Academy Management" />} />
                            <Route path="staff" element={<StaffRoster />} />
                            <Route path="treasury" element={<ComingSoon title="Treasury & Finance" />} />
                            <Route path="athletes" element={<AthletesRoster />} />
                            <Route path="schedule" element={<SchedulePage />} />
                            <Route path="feed" element={<ComingSoon title="Live Feed" />} />
                            <Route path="settings" element={<ComingSoon title="System Settings" />} />
                            <Route path="profile" element={<OwnerProfile />} />

                        </Route>
                    </Route>

                    {/* COACH ZONE */}
                    <Route path="/coach" element={<ProtectedRoute />}>
                        <Route element={<CoachLayout />}>
                            <Route index element={<Navigate to="/coach/dashboard" replace />} />
                            <Route path="dashboard" element={<CoachDashboard />} />
                            <Route path="schedule" element={<CoachSchedule />} />
                            <Route path="athletes" element={<CoachRoster />} />
                            <Route path="profile" element={<CoachProfile />} />
                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/coach/dashboard" replace />} />
                        </Route>
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
