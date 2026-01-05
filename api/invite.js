import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, firstName, role, employmentType, salary, hourlyRate, avatarColor } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // 1. Check if user exists
        // Note: admin.listUsers is expensive, better to try invite or get by email if possible.
        // But generateLink works even if user doesn't exist? Actually generateLink implies creating a user.

        // Let's use clean approach: Generate Invite Link
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                redirectTo: 'https://wildrobot.com/join', // or local URL?
                data: {
                    full_name: firstName, // We only have First Name? 
                    role: role || 'coach',
                    avatar_color: avatarColor
                }
            }
        });

        if (error) {
            // Use might already exist?
            // If user exists, we can't generate an 'invite' link usually unless they are not confirmed?
            // Fallback: If error is "User already registered", maybe we just return a login link or handle gracefully?
            console.error("Invite Error:", error);
            return res.status(400).json({ error: error.message });
        }

        // 2. Create/Update Profile with extras (Shadow Profile)
        // The trigger usually creates profile on user creation, but we might want to pre-fill extra fields
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    employment_type: employmentType,
                    salary: salary,
                    hourly_rate: hourlyRate,
                    avatar_color: avatarColor,
                    // If trigger didn't catch invite metadata, forcing it here:
                    role: role || 'coach'
                })
                .eq('id', data.user.id);

            if (profileError) {
                console.warn("Profile update warning:", profileError);
                // Not fatal
            }
        }

        const inviteLink = data.properties?.action_link || data.properties?.email_otp || "https://wildrobot.com/login";
        // generateLink returns properties with action_link

        return res.status(200).json({
            success: true,
            inviteLink: data.properties?.action_link,
            user: data.user
        });

    } catch (err) {
        console.error("Handler Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
