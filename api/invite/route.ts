import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, firstName, lastName, role, salary, color } = body;

        // 1. Basic Validation
        if (!email || !firstName || !lastName || !role) {
            return new Response(JSON.stringify({ error: 'Missing required fields: Email, Name, and Role are mandatory.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Initialize Supabase Admin (Service Role)
        // CRITICAL: This bypasses Row Level Security (RLS) to ensure we can insert the profile.
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
            return new Response(JSON.stringify({ error: 'Server misconfiguration: Missing Service Role Key' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // 3. Invite User via Email
        const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                data: {
                    full_name: `${firstName} ${lastName}`,
                    role: role,
                },
                // redirectTo: 'https://wildrobot.com/update-password' 
            }
        );

        if (inviteError) {
            console.error('Invite Error:', inviteError);
            return new Response(JSON.stringify({ error: inviteError.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 4. Create/Update Profile (The "Real Data" Step)
        // We immediately create the profile so the staff member appears in the list even before they accept.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                role: role,
                salary: parseFloat(salary) || 0,
                avatar_color: color || '#10B981', // Default Emerald
                academy_id: 'default' // Temporary fallback
            });

        if (profileError) {
            console.error('Profile Creation Error:', profileError);
            return new Response(JSON.stringify({ error: 'User invited, but profile creation failed. ' + profileError.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, user: authData.user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
