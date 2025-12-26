import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    EMPLOYEE_COACH: 'employee_coach',
    FREELANCE_COACH: 'freelance_coach',
    STUDENT: 'student'
};

export function RoleProvider({ children }) {
    const [currentRole, setCurrentRole] = useState(ROLES.SUPER_ADMIN);
    const [isDevMode, setIsDevMode] = useState(false);

    // Initial check (mock ID check for "Abdulla")
    // In production, we'd check supabase.auth.user().id === 'SPECIFIC_ID'
    useEffect(() => {
        // Automatically enable Dev Mode for this session for demonstration
        setIsDevMode(true);
    }, []);

    const switchRole = (role) => {
        setCurrentRole(role);
        console.log(`[Role Context] Switched to: ${role}`);
        // Here we could also trigger toast notifications or redirects if needed
    };

    return (
        <RoleContext.Provider value={{ currentRole, switchRole, isDevMode, ROLES }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    return useContext(RoleContext);
}
