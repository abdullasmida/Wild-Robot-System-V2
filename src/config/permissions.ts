import { useAuthStore } from '@/stores/useAuthStore';

// --- Role Definitions ---
// Matches Supabase `roles` or `profiles.role`
export type UserRole = 'owner' | 'manager' | 'head_coach' | 'coach' | 'admin' | 'hr' | 'accountant' | 'athlete';

// --- Permission Keys ---
export type Permission =
    | 'VIEW_DASHBOARD'
    | 'VIEW_FINANCE'       // Treasury
    | 'MANAGE_FINANCE'     // Withdraw, Settings
    | 'VIEW_TEAM'          // Staff Roster
    | 'MANAGE_TEAM'        // Add/Edit Staff
    | 'VIEW_ATHLETES'      // Roster
    | 'MANAGE_ATHLETES'    // Add/Edit Athletes
    | 'VIEW_SCHEDULE'      // Calendar
    | 'MANAGE_SCHEDULE'    // Create Shifts/Sessions
    | 'VIEW_SETTINGS'
    | 'VIEW_FINANCE_DASHBOARD'
    | 'VIEW_COACH_DASHBOARD';

// --- Permission Matrix ---
// Maps Permission -> Allowed Roles
export const PERMISSIONS_MATRIX: Record<Permission, UserRole[]> = {
    VIEW_DASHBOARD: ['owner', 'manager', 'head_coach', 'coach', 'admin', 'hr', 'accountant'],

    // Finance / Treasury
    VIEW_FINANCE: ['owner', 'accountant', 'manager'],
    MANAGE_FINANCE: ['owner'],

    // Team / Staff
    VIEW_TEAM: ['owner', 'manager', 'hr', 'head_coach'],
    MANAGE_TEAM: ['owner', 'manager', 'hr'],

    // Athletes
    VIEW_ATHLETES: ['owner', 'manager', 'head_coach', 'coach', 'admin'],
    MANAGE_ATHLETES: ['owner', 'manager', 'head_coach'],

    // Schedule
    VIEW_SCHEDULE: ['owner', 'manager', 'head_coach', 'coach', 'admin'],
    MANAGE_SCHEDULE: ['owner', 'manager', 'head_coach'],

    // System
    VIEW_SETTINGS: ['owner', 'admin'],

    // Dashboards
    // Dashboards
    VIEW_FINANCE_DASHBOARD: ['owner', 'accountant'],
    VIEW_COACH_DASHBOARD: ['coach', 'head_coach'],
};

// --- Hook ---
export function usePermission(permission: Permission): boolean {
    const { user } = useAuthStore();

    if (!user) return false;

    const userRole = (user.role || 'athlete').toLowerCase() as UserRole;

    // Super Admin / Owner Override (Optional, but safer to be explicit in matrix)
    if (userRole === 'owner') return true;

    const allowedRoles = PERMISSIONS_MATRIX[permission];
    return allowedRoles.includes(userRole);
}

// --- Helper for Layouts ---
export function hasPermission(role: string, permission: Permission): boolean {
    const normalizedRole = (role || 'athlete').toLowerCase() as UserRole;
    if (normalizedRole === 'owner') return true;
    return PERMISSIONS_MATRIX[permission].includes(normalizedRole);
}
