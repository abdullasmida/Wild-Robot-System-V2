
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log("Checking profiles...");
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Found Profiles:", profiles.length);
        profiles.forEach(p => console.log(`- ${p.email} (Role: ${p.role})`));

        const salesUser = profiles.find(p => p.email === 'sales@wildrobot.com');
        if (salesUser) {
            console.log("\nSales user FOUND in profiles.");
        } else {
            console.log("\nSales user NOT FOUND in profiles.");
        }
    }
}

checkUsers();
