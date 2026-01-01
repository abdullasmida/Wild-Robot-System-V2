import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // The magic happens here. Supabase SDK automatically parses the hash from the URL
        // and establishes the session in local storage.
        // We just need to wait for it and then redirect.

        const handleAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Callback Error:", error);
                navigate('/login');
                return;
            }

            if (session) {
                // Check if this is a "Password Recovery" or "Invite" flow
                // Usually indicated by type=recovery or type=invite in the URL, 
                // but simpler to just check if the user needs setup.
                navigate('/auth/setup-account');
            } else {
                // Fallback
                navigate('/login');
            }
        };

        handleAuth();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-slate-500">Verifying Ticket...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
