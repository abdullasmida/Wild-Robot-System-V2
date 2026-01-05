// This is a Vercel Serverless Function
// It allows us to send invites securely without exposing keys in the client
// To deploy, just push to Vercel. For local dev, you'd typically need 'vercel dev'
// If running standard 'vite', this endpoint won't be reachable at /api/send-invite
// unless you configure a proxy in vite.config.js or use Supabase Functions.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, firstName, role } = request.body;
        console.log(`[API] Attempting to invite ${email} as ${role}...`);

        if (!process.env.RESEND_API_KEY) {
            console.error('[API] RESEND_API_KEY is missing');
            return response.status(500).json({ error: 'Server misconfiguration: Missing Email Key' });
        }

        const { data, error } = await resend.emails.send({
            from: 'Wild Robot <onboarding@wildrobot.system>', // Update this with your verified domain
            to: [email],
            subject: 'Welcome to the Team | Wild Robot',
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Welcome, ${firstName}!</h1>
                    <p>You have been invited to join <strong>Wild Robot Academy</strong> as a <strong>${role}</strong>.</p>
                    <p>Click the link below to set up your profile:</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/join?email=${email}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Team</a>
                </div>
            `,
        });

        if (error) {
            console.error('[API] Resend Error:', error);
            return response.status(400).json({ error: error.message });
        }

        console.log('[API] Email sent successfully:', data);
        return response.status(200).json({ message: 'Invite sent', id: data.id });

    } catch (err) {
        console.error('[API] Unexpected Error:', err);
        return response.status(500).json({ error: err.message });
    }
}
