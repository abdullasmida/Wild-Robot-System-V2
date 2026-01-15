import { supabase } from '../supabaseClient';

export const seedAthletes = async (count = 10) => {
    console.log(`🚀 Starting Seed: ${count} Test Athletes...`);

    try {
        // 1. Get Current User & Academy
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No active session");

        const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.id).single();
        if (!profile?.academy_id) throw new Error("No Academy Linked");

        let success = 0;

        for (let i = 1; i <= count; i++) {
            const num = Math.floor(Math.random() * 1000);
            const name = `Test Player ${i} (${num})`;
            const guardianName = `Test Parent ${i}`;

            // A. Create Guardian
            const { data: guardian, error: gErr } = await supabase
                .from('guardians')
                .insert({
                    academy_id: profile.academy_id,
                    name: guardianName,
                    phone: `+971 50 000 ${String(i).padStart(4, '0')}`,
                    relationship_type: 'parent'
                })
                .select()
                .single();

            if (gErr) { console.error(`Failed Parent ${i}`, gErr); continue; }

            // B. Create Athlete
            const { data: athlete, error: aErr } = await supabase
                .from('athletes')
                .insert({
                    academy_id: profile.academy_id,
                    name: name,
                    gender: i % 2 === 0 ? 'male' : 'female',
                    dob: `201${i % 5}-01-01`,
                    stats: { overall: 50 + i },
                    medical_info: { tags: [] }
                })
                .select()
                .single();

            if (aErr) { console.error(`Failed Athlete ${i}`, aErr); continue; }

            // C. Link
            const { error: lErr } = await supabase
                .from('athlete_guardians')
                .insert({
                    athlete_id: athlete.id,
                    guardian_id: guardian.id
                });

            if (lErr) { console.error(`Failed Link ${i}`, lErr); continue; }

            success++;
            console.log(`✅ Created: ${name}`);
        }

        console.log(`🏁 Seed Complete! Success: ${success}/${count}`);

    } catch (e) {
        console.error("Seed Critical Error:", e);
    }
};
