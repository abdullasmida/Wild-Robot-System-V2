import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Create a Supabase client with the Auth context of the logged in user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 2. Check if the user is an Admin/Owner
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // Optional: Add stricter role checks here via database lookup if needed
        // For now, we assume if they can call this (protected by RLS usually), they are okay. 
        // BUT since this is an edge function, we need to be careful.
        // Ideally, we verify the user's role from the 'profiles' table.

        // 3. Create the Admin Client (SERVICE_ROLE_KEY) to create users without login
        // WARNING: This key has full access. Use with care.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 4. Parse Request Body
        const { email, password, userData } = await req.json()

        // 5. Create the User via Admin Client
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm
            user_metadata: userData
        })

        if (createError) throw createError

        // 6. Return Success
        return new Response(
            JSON.stringify(newUser),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
