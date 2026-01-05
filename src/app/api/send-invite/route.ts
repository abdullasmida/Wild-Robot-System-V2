import { Resend } from 'resend';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, firstName, role } = body;

        console.log(`[App Router] Attempting to invite ${email} as ${role}...`);

        if (!process.env.RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'Wild Robot <onboarding@wildrobot.system>',
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
            console.error('[App Router] Resend Error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ message: 'Invite sent', id: data.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('[App Router] Unexpected Error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
