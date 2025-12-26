import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ----------------------------------------------------------------------
// 1. Imports
// ----------------------------------------------------------------------

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

import MobileLogin from './pages/auth/MobileLogin';
import Pricing from './pages/auth/Pricing';
import FakeCheckout from './pages/auth/FakeCheckout';
import SetupWizard from './pages/onboarding/SetupWizard';

// Layouts
import Layout from './components/Layout';
import CoachLayout from './layouts/CoachLayout';
// 👇 هنا الخدعة: بنستورد الملف القديم بس بندلعه باسم جديد
import AthleteLayout from './layouts/StudentLayout';

// Athlete Pages
import AthleteHome from "./pages/Athlete/AthleteHome";
import Achievements from "./pages/Athlete/Achievements";

// Lazy Loading (غيرنا أسماء المتغيرات لـ Athlete)
const AthleteBilling = React.lazy(() => import('./pages/Athlete/Billing'));
const AthleteSettings = React.lazy(() => import('./pages/Athlete/Settings'));

// Coach Pages
import CoachHome from './pages/coach/CoachHome';
import CoachSchedule from './pages/coach/Schedule';
import MasterCalendar from './pages/coach/MasterCalendar';
import SessionCommander from './pages/coach/SessionCommander';
import Analytics from './pages/coach/management/Analytics';
import StaffManagement from './pages/coach/management/StaffManagement';
import FinanceDashboard from './pages/coach/management/FinanceDashboard';
import Profile from './pages/coach/Profile';
import CoachSettings from './pages/coach/Settings';
import Earnings from './pages/coach/Earnings';
import Support from './pages/coach/Support';
import Roster from './pages/coach/Roster';
import SkillEvaluation from './pages/SkillEvaluation';

// Shared
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import SecurityCheckpointPage from './components/SecurityCheckpoint';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import GranularErrorBoundary from './components/GranularErrorBoundary';
import CommandPalette from './components/CommandPalette';
import AuthGuard from './components/AuthGuard';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <CommandPalette />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/athlete/login" element={<Navigate to="/login" replace />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/setup" element={<SetupWizard />} />
                    <Route path="/checkout" element={<FakeCheckout />} />
                    <Route path="/security-checkpoint" element={<SecurityCheckpointPage />} />

                    {/* 🔄 تحويل الروابط القديمة للجديدة */}
                    <Route path="/student/*" element={<Navigate to="/athlete" replace />} />

                    {/* 🏅 ATHLETE DASHBOARD (SECURED 🛡️) */}
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

                    {/* 👮 COACH DASHBOARD */}
                    <Route path="/coach" element={
                        <GranularErrorBoundary>
                            <AuthGuard>
                                <CoachLayout />
                            </AuthGuard>
                        </GranularErrorBoundary>
                    }>
                        <Route path="home" element={<CoachHome />} />
                        <Route path="calendar" element={<MasterCalendar />} />
                        <Route path="schedule" element={<CoachSchedule />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<CoachSettings />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="finance" element={<FinanceDashboard />} />
                        <Route path="roster" element={<Roster />} />
                        <Route path="skills" element={<SkillEvaluation />} />
                        <Route path="earnings" element={<Earnings />} />
                        <Route path="support" element={<Support />} />
                        <Route path="session/:sessionId" element={<SessionCommander />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;