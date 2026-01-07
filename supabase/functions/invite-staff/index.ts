// supabase/functions/invite-staff/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // التعامل مع طلب الـ CORS (عشان المتصفح ميعملش مشاكل)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. استقبال البيانات
        const { email, firstName, lastName, role, salary, color } = await req.json()

        // 2. إنشاء عميل Supabase بصلاحيات الـ Service Role (الأدمن)
        // المفتاح ده بييجي أوتوماتيك من بيئة العمل في السحابة
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. إرسال الدعوة
        const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                data: {
                    full_name: `${firstName} ${lastName}`,
                    role: role,
                },
                // رابط إعادة التوجيه بعد قبول الدعوة
                redirectTo: 'http://localhost:5173/update-password'
            }
        )

        if (inviteError) throw inviteError

        // 4. إنشاء البروفايل فوراً
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                role: role,
                salary: Number(salary) || 0,
                avatar_color: color
            })

        if (profileError) throw profileError

        // 5. الرد بالنجاح
        return new Response(
            JSON.stringify({ message: 'Invite sent successfully', user: authData.user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})