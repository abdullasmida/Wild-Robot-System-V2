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
import OwnerProfile from './pages/owner/OwnerProfile';
import FinanceDashboard from './pages/owner/FinanceDashboard.jsx';
import HQSettings from './pages/owner/HQSettings';
import AcademicCalendar from './pages/command/AcademicCalendar';

// Athlete Pages
import AthleteHome from './pages/Athlete/AthleteHome';
import Achievements from './pages/Athlete/Achievements';

// Workspace / Dual Track
import CommandLayout from './layouts/CommandLayout';
import StaffLayout from './layouts/StaffLayout';
import WorkspaceDashboard from './pages/workspace/WorkspaceDashboard';

// Coach Pages (Specific routes used in Workspace or Onboarding)
import CoachSchedule from './pages/coach/CoachSchedule';
import CoachOnboarding from './pages/onboarding/CoachOnboarding';

// Training
import SkillLibrary from './pages/training/SkillLibrary';
import PlanBuilder from './pages/training/PlanBuilder';

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
                        👑 COMMAND ZONE (Owners & Managers)
                    ----------------------------------------------------------------- */}
                    <Route
                        path="/command"
                        element={
                            <AuthGuard requiredZone="command">
                                <CommandLayout />
                            </AuthGuard>
                        }
                    >
                        <Route index element={<Navigate to="/command/dashboard" replace />} />
                        <Route path="dashboard" element={<WorkspaceDashboard />} />
                        <Route path="schedule" element={<SchedulePage />} />
                        <Route path="feed" element={<ComingSoon title="Live Operations Feed" />} />
                        <Route path="staff" element={<StaffRoster />} />
                        <Route path="athletes" element={<AthletesRoster />} />
                        <Route path="finance" element={<FinanceDashboard />} />
                        <Route path="calendar" element={<AcademicCalendar />} />
                        <Route path="training" element={<SkillLibrary />} />
                        <Route path="training/builder" element={<PlanBuilder />} />
                        <Route path="settings" element={<HQSettings />} />
                    </Route>

                    {/* -----------------------------------------------------------------
                        🧢 STAFF ZONE (Field Ops)
                    ----------------------------------------------------------------- */}
                    <Route
                        path="/staff"
                        element={
                            <AuthGuard requiredZone="staff">
                                <StaffLayout />
                            </AuthGuard>
                        }
                    >
                        <Route index element={<Navigate to="/staff/dashboard" replace />} />
                        {/* Reuse WorkspaceDashboard but it will adapt based on role/layout context? 
                            Ideally we should have StaffDashboard. For now re-use. */}
                        <Route path="dashboard" element={<WorkspaceDashboard />} />
                        <Route path="schedule" element={<CoachSchedule />} /> {/* Staff see CoachSchedule */}
                        <Route path="calendar" element={<AcademicCalendar />} />
                        <Route path="training" element={<SkillLibrary />} />
                        <Route path="training/builder" element={<PlanBuilder />} />
                        <Route path="chat" element={<ComingSoon title="Team Chat" />} />
                        <Route path="profile" element={<OwnerProfile />} /> {/* Re-use profile for now */}
                    </Route>

                    {/* -----------------------------------------------------------------
                        🔄 LEGACY REDIRECTS (Migration Helper)
                    ----------------------------------------------------------------- */}
                    <Route path="/workspace/*" element={<Navigate to="/command/dashboard" replace />} />
                    <Route path="/owner/*" element={<Navigate to="/command/dashboard" replace />} />
                    <Route path="/coach/*" element={<Navigate to="/staff/dashboard" replace />} />

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
