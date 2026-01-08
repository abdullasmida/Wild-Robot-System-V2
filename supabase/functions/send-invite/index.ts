import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { email, firstName, lastName, role, inviteLink, academyName } = await req.json();

        if (!email) {
            throw new Error("Missing email");
        }

        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .header { background: #10B981; padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 800; }
            .content { padding: 40px 30px; }
            .welcome-text { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
            .role-badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
            .btn { display: block; width: 100%; background: #10B981; color: white; text-decoration: none; padding: 16px 0; border-radius: 12px; font-weight: bold; text-align: center; margin: 30px 0; font-size: 16px; transition: background 0.2s; }
            .btn:hover { background: #059669; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to the Team! 🚀</h1>
            </div>
            <div class="content">
                <p class="welcome-text">Hi <strong>${firstName}</strong>,</p>
                <p class="welcome-text">
                    You have been invited to join <strong>${academyName || 'Wild Robot Academy'}</strong>.
                    We are excited to have you on board!
                </p>
                <div style="text-align: center;">
                    <span class="role-badge">Role: ${role || 'Staff Member'}</span>
                </div>
                <a href="${inviteLink}" class="btn">Accept Invitation & Setup Account</a>
                <p class="welcome-text" style="font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${inviteLink}" style="color: #10B981; word-break: break-all;">${inviteLink}</a>
                </p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Wild Robot System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

        const data = await resend.emails.send({
            from: "Wild Robot <onboarding@resend.dev>", // Default testing domain. User can change later.
            to: [email], // In Resend Free tier, can only send to registered email (auth user)
            subject: `You're invited to join ${academyName || 'the team'}!`,
            html: htmlContent,
        });

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
