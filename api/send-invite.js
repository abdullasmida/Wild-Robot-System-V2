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
        const { email, firstName, role, token, specialization } = request.body;

        let displayRole = role;
        if (specialization) {
            displayRole = `${specialization} ${role.replace('_', ' ')}`;
        } else {
            displayRole = role.replace('_', ' '); // clean up 'head_coach'
        }

        // Capitalize
        displayRole = displayRole.replace(/\b\w/g, l => l.toUpperCase());

        console.log(`[API] Attempting to invite ${email} as ${displayRole}...`);

        if (!process.env.RESEND_API_KEY) {
            console.error('[API] RESEND_API_KEY is missing');
            return response.status(500).json({ error: 'Server misconfiguration: Missing Email Key' });
        }

        let inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/join?token=${token}`;

        // Fallback if no token provided (legacy support)
        if (!token) {
            inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/join?email=${email}`;
        }

        const subject = role === 'athlete'
            ? 'You have been scouted! | Wild Robot'
            : `Welcome to the Team as ${displayRole} | Wild Robot`;

        const htmlContent = role === 'athlete' ? `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; text-align: center;">
                <h1 style="color: #10b981;">Welcome to the Squad, ${firstName}!</h1>
                <p>Your coach has recruited you to join <strong>Wild Robot Academy</strong>.</p>
                <p>Accept this mission to track your stats, view your schedule, and level up.</p>
                <br/>
                <a href="${inviteLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Accept Mission</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy this link: ${inviteLink}</p>
            </div>
        ` : `
            <div style="font-family: sans-serif; color: #333;">
                <h1>Welcome, ${firstName}!</h1>
                <p>You have been invited to join <strong>Wild Robot Academy</strong> as a <strong>${displayRole}</strong>.</p>
                <p>Click the link below to set up your profile:</p>
                <a href="${inviteLink}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Team</a>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'Wild Robot <onboarding@wildrobot.system>',
            to: [email],
            subject: subject,
            html: htmlContent,
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
