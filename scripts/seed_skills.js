import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for ESM directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const CSV_FILENAME = 'skill_library.csv'; // Expects this in valid path
// NOTE: You must provide these or load from .env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

// --- LOGIC ---

async function main() {
    console.log("🚀 Starting Skill Library Import...");

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_ROLE_KEY') {
        console.error("❌ Missing Credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.");
        console.log("Tip: Run specific command or use dotenv.");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Locate CSV
    // Try root first, then current dir
    let csvPath = path.resolve(process.cwd(), CSV_FILENAME);
    if (!fs.existsSync(csvPath)) {
        csvPath = path.resolve(__dirname, '..', CSV_FILENAME);
    }

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ CSV File not found: ${CSV_FILENAME}`);
        console.log("Please place the CSV in the project root.");
        process.exit(1);
    }

    console.log(`📂 Found CSV: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // 2. Parse CSV (Simple Parser)
    // Assumes header: Level, Apparatus, Category, Skill
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

    console.log(`📊 Found ${dataRows.length} skills to process.`);

    // 3. Fetch Maps (Level & Apparatus)
    console.log("🔄 Fetching Metadata...");

    // Levels
    const { data: levels, error: levelError } = await supabase.from('levels').select('id, name');
    if (levelError) throw levelError;
    const levelMap = new Map(levels.map(l => [l.name.toLowerCase().trim(), l.id]));

    // Apparatus
    const { data: apparatuses, error: appError } = await supabase.from('apparatus').select('id, name');
    if (appError) throw appError;
    const apparatusMap = new Map(apparatuses.map(a => [a.name.toLowerCase().trim(), a.id]));

    console.log(`✅ Loaded Maps: ${levels.length} Levels, ${apparatuses.length} Apparatus.`);

    // 4. Transform & Process
    const skillsToInsert = [];
    const missingLevels = new Set();
    const missingApparatus = new Set();

    for (const row of dataRows) {
        // Simple Split (Handle commas in quotes if needed - currently naive split)
        // If your descriptions have commas, this needs a regex parser.
        // For "Level, Apparatus, Category, Skill" it's usually safe if Skill names don't have commas.
        const cols = row.split(',').map(c => c.trim());

        // Map columns based on Index (safer if headers change order, but we assume fixed structure for now or map dynamically)
        // Let's use dynamic mapping if possible
        const getCol = (name) => {
            const idx = headers.findIndex(h => h.includes(name));
            return idx !== -1 ? cols[idx] : null;
        };

        const levelName = getCol('level');
        const appName = getCol('apparatus');
        // const category = getCol('category'); // Not used in schema yet or maps to tags?
        const skillName = getCol('skill');

        if (!skillName) continue;

        const levelId = levelName ? levelMap.get(levelName.toLowerCase()) : null;
        const appId = appName ? apparatusMap.get(appName.toLowerCase()) : null;

        if (levelName && !levelId) missingLevels.add(levelName);
        if (appName && !appId) missingApparatus.add(appName);

        skillsToInsert.push({
            name: skillName,
            level_id: levelId || null,
            apparatus_id: appId || null,
            video_provider_id: 'dQw4w9WgXcQ', // Rick Roll Placeholder
            preview_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg', // Placeholder
            // created_at: new Date()
        });
    }

    if (missingLevels.size > 0) console.warn("⚠️  Missing Levels in DB:", [...missingLevels]);
    if (missingApparatus.size > 0) console.warn("⚠️  Missing Apparatus in DB:", [...missingApparatus]);

    // 5. Insert (Batch)
    if (skillsToInsert.length > 0) {
        console.log(`💾 Inserting ${skillsToInsert.length} skills...`);

        // Batch size 50
        const batchSize = 50;
        for (let i = 0; i < skillsToInsert.length; i += batchSize) {
            const batch = skillsToInsert.slice(i, i + batchSize);
            const { error: insertError } = await supabase.from('skills').insert(batch);

            if (insertError) {
                console.error(`❌ Batch Error (${i}-${i + batchSize}):`, insertError.message);
            } else {
                console.log(`   ✅ Inserted ${i + batch.length}/${skillsToInsert.length}`);
            }
        }
        console.log("✨ Import Complete!");
    } else {
        console.log("⚠️ No valid skills found to insert.");
    }
}

main().catch(e => console.error(e));
