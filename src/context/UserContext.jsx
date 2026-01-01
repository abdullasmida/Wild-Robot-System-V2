import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [academy, setAcademy] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch data and update state
    const fetchUserData = async () => {
        try {
            // 1. Check current session
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            if (authUser) {
                // 2. Fetch Profile (ensuring it exists)
                const { data: userProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .maybeSingle();

                if (profileError) throw profileError;
                setProfile(userProfile);

                // 3. Fetch Academy (only if user is linked to one)
                if (userProfile?.academy_id) {
                    const { data: userAcademy, error: academyError } = await supabase
                        .from('academies')
                        .select('*')
                        .eq('id', userProfile.academy_id)
                        .maybeSingle();

                    if (academyError) throw academyError;
                    setAcademy(userAcademy);
                } else {
                    setAcademy(null); // New user, setup not done
                }
            }
        } catch (error) {
            console.error('🔴 Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Monitor auth state automatically
    useEffect(() => {
        fetchUserData();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Update data if user changed
                if (session?.user?.id !== user?.id) fetchUserData();
            } else if (event === 'SIGNED_OUT') {
                // Clear data on logout
                setUser(null);
                setProfile(null);
                setAcademy(null);
                setLoading(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Manual refresh function (to use after Setup)
    const refreshProfile = async () => {
        setLoading(true);
        await fetchUserData();
    };

    return (
        <UserContext.Provider value={{ user, profile, academy, loading, refreshProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
