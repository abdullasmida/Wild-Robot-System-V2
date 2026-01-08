import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

// 1. Imports

// Auth
import Login from './pages/auth/Login';  // REFACTORED LOGIN
import AcademyWizard from './pages/auth/AcademyWizard';
import Pricing from './pages/auth/Pricing';
import FakeCheckout from './pages/auth/FakeCheckout';
import AuthCallback from './pages/auth/AuthCallback';
import SetupAccount from './pages/auth/SetupAccount';
import SetupPasswordPage from './pages/onboarding/SetupPassword';
import LoginSelection from './pages/LoginSelection'; // NEW SELECTION SCREEN

// Layouts
import AthleteLayout from './layouts/StudentLayout';

// Owner Pages
import AcademySetup from './pages/owner/AcademySetup';
import StaffRoster from './pages/owner/StaffRoster';
import AthletesRoster from './pages/owner/AthletesRoster';
import SchedulePage from './pages/SchedulePage';

// Athlete Pages
import AthleteHome from './pages/Athlete/AthleteHome';
import Achievements from './pages/Athlete/Achievements';

// Workspace
import WorkspaceLayout from './layouts/WorkspaceLayout';
import WorkspaceDashboard from './pages/workspace/WorkspaceDashboard';

// Coach Pages (Specific routes used in Workspace or Onboarding)
import CoachSchedule from './pages/coach/CoachSchedule';
import CoachOnboarding from './pages/onboarding/CoachOnboarding';

// Lazy Loading
const AthleteBilling = React.lazy(() => import('./pages/Athlete/Billing'));
const AthleteSettings = React.lazy(() => import('./pages/Athlete/Settings'));
const ClaimProfile = React.lazy(() => import('./pages/ClaimProfile'));

import JoinTeam from './pages/JoinTeam';

// Shared
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import SecurityCheckpointPage from './components/SecurityCheckpoint';
import ComingSoon from './components/ComingSoon';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import AuthGuard from './components/AuthGuard';


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

                    {/* PORTAL SELECTION */}
                    <Route path="/portal-select" element={<LoginSelection />} />

                    {/* LOGIN ROUTES */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/student/login" element={<Login initialMode="athlete" />} />
                    <Route path="/athlete/login" element={<Navigate to="/student/login" replace />} />

                    <Route path="/signup" element={<AcademyWizard />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/checkout" element={<FakeCheckout />} />
                    <Route path="/security-checkpoint" element={<SecurityCheckpointPage />} />



                    {/* Authentication Flow */}
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/setup-account" element={<SetupAccount />} />
                    <Route path="/setup-password" element={<SetupPasswordPage />} />

                    {/* Coach Availability/Onboarding */}
                    <Route path="/onboarding" element={
                        <AuthGuard requiredZone="staff">
                            <CoachOnboarding />
                        </AuthGuard>
                    } />

                    {/* Public Staff Invite Link */}
                    <Route path="/join" element={<JoinTeam />} />

                    {/* Public Athlete Claim Link */}
                    <Route path="/claim" element={
                        <React.Suspense fallback={<div>Loading...</div>}>
                            <ClaimProfile />
                        </React.Suspense>
                    } />

                    {/* -----------------------------------------------------------------
                        🛡️ OWNER SETUP ZONE
                    ----------------------------------------------------------------- */}
                    {/* -----------------------------------------------------------------
                        🛡️ OWNER SETUP ZONE
                    ----------------------------------------------------------------- */}
                    <Route
                        path="/setup"
                        element={
                            <AuthGuard requiredZone="staff" allowSetup={true}>
                                <AcademySetup />
                            </AuthGuard>
                        }
                    />

                    {/* -----------------------------------------------------------------
                        🏰 STAFF ZONE (Owners & Coaches)
                    ----------------------------------------------------------------- */}
                    {/* OWNER ROUTES */}

                    {/* -----------------------------------------------------------------
                        🚀 WORKSPACE ZONE (Unified Staff Portal)
                    ----------------------------------------------------------------- */}
                    <Route
                        path="/workspace"
                        element={
                            <AuthGuard requiredZone="staff">
                                <WorkspaceLayout />
                            </AuthGuard>
                        }
                    >
                        <Route index element={<Navigate to="/workspace/dashboard" replace />} />
                        <Route path="dashboard" element={<WorkspaceDashboard />} />

                        {/* Modules (Shared or Role-Guarded internally) */}
                        <Route path="schedule" element={<SchedulePage />} />
                        {/* Note: SchedulePage needs to support 'Coach' mode or be wrapped. 
                            For now, owners use SchedulePage. Coaches use CoachSchedule.
                            We need a 'SmartSchedule' wrapper? 
                            Let's map directly for now and trust the user role context if the component handles it, 
                            OR use a specific wrapper if they differ significantly.
                            Owner's SchedulePage might be too admin-heavy.
                        */}

                        <Route path="feed" element={<ComingSoon title="Live Feed" />} />
                        <Route path="staff" element={<StaffRoster />} />
                        <Route path="athletes" element={<AthletesRoster />} />
                        <Route path="treasury" element={<ComingSoon title="Treasury" />} />
                        <Route path="settings" element={<ComingSoon title="Settings" />} />
                    </Route>

                    {/* -----------------------------------------------------------------
                        🏰 LEGACY ZONES (Fallbacks)
                    ----------------------------------------------------------------- */}
                    {/* 🔄 Legacy Redirects (Catch-all for old bookmarks) */}
                    <Route path="/owner/*" element={<Navigate to="/workspace/dashboard" replace />} />
                    <Route path="/coach/*" element={<Navigate to="/workspace/dashboard" replace />} />

                    {/* 🔄 Legacy Redirects */}
                    <Route path="/student/*" element={<Navigate to="/athlete" replace />} />

                    {/* 🏅 ATHLETE DASHBOARD */}
                    <Route path="/athlete" element={
                        <AuthGuard requiredZone="athlete">
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
