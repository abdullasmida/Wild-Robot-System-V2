import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser'; // Requires: npm install csv-parser
import dotenv from 'dotenv';   // Requires: npm install dotenv
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Env Vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Environment Variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    console.log('Ensure you have a .env file in the project root.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CSV_FILE_PATH = path.resolve(__dirname, '../skill_library.csv');

async function seedSkills() {
    console.log('🚀 Starting Skill Library ETL...');

    // 1. Validation: Check if csv exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error(`❌ File not found: ${CSV_FILE_PATH}`);
        process.exit(1);
    }

    // 2. Preparation: Get/Create Curriculum
    const CURRICULUM_NAME = "USAG Women's Artistic";
    console.log(`🔍 Checking Curriculum: "${CURRICULUM_NAME}"...`);

    let curriculumId = null;
    const { data: existingCurr, error: currFetchError } = await supabase
        .from('curriculums')
        .select('id')
        .eq('name', CURRICULUM_NAME)
        .maybeSingle();

    if (currFetchError) throw currFetchError;

    if (existingCurr) {
        curriculumId = existingCurr.id;
        console.log(`   ✅ Found active curriculum (${curriculumId})`);
    } else {
        console.log(`   ✨ Creating new curriculum...`);
        const { data: newCurr, error: currCreateError } = await supabase
            .from('curriculums')
            .insert({
                name: CURRICULUM_NAME,
                version: '2024-2025 Standard',
                is_active: true
            })
            .select('id')
            .single();

        if (currCreateError) throw currCreateError;
        curriculumId = newCurr.id;
    }

    // 3. Preparation: Load Maps (Level & Apparatus)
    console.log('📦 Loading Reference Maps...');

    const { data: levels } = await supabase.from('levels').select('id, name');
    const { data: apparatus } = await supabase.from('apparatus').select('id, name');

    // Create Case-Insensitive Maps
    const levelMap = new Map(levels?.map(l => [l.name.toLowerCase().trim(), l.id]));
    const appMap = new Map(apparatus?.map(a => [a.name.toLowerCase().trim(), a.id]));

    console.log(`   ✅ Loaded ${levelMap.size} Levels, ${appMap.size} Apparatus.`);

    // 4. Processing CSV
    console.log('🔄 Processing CSV Rows...');
    const skillsToInsert = [];
    const missingRefs = new Set();

    fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
            // Normalize Keys (Handle potential BOM or whitespace in headers)
            const cleanRow = {};
            Object.keys(row).forEach(k => cleanRow[k.trim()] = row[k]?.trim());

            const levelName = cleanRow['Level'];
            const appName = cleanRow['Apparatus'];
            const skillName = cleanRow['Skill'];
            const category = cleanRow['Category'];

            if (!skillName) return; // Skip empty rows

            const levelId = levelMap.get(levelName?.toLowerCase());
            const appId = appMap.get(appName?.toLowerCase());

            if (levelName && !levelId) missingRefs.add(`Missing Level: ${levelName}`);
            if (appName && !appId) missingRefs.add(`Missing Apparatus: ${appName}`);

            // Construct Description using Category + Targets
            let description = '';
            if (category) description += `Category: ${category}\n`;
            if (cleanRow['TargetValue']) description += `Target: ${cleanRow['TargetValue']} ${cleanRow['TargetUnitOrMetric'] || ''}`;

            skillsToInsert.push({
                name: skillName,
                level_id: levelId || null,
                apparatus_id: appId || null,
                curriculum_id: curriculumId,
                description: description.trim() || null,
                video_provider_id: 'dQw4w9WgXcQ', // Placeholder
                preview_url: 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Skill', // Placeholder
                video_platform: 'youtube'
            });
        })
        .on('end', async () => {
            if (missingRefs.size > 0) {
                console.warn('\n⚠️  Reference Warnings:', [...missingRefs]);
            }

            // 5. Bulk Insert
            if (skillsToInsert.length > 0) {
                console.log(`\n💾 Inserting ${skillsToInsert.length} skills into DB...`);

                // Supabase limit is usually handled well, but chunking is safer for 1000+ items
                const CHUNK_SIZE = 100;
                for (let i = 0; i < skillsToInsert.length; i += CHUNK_SIZE) {
                    const chunk = skillsToInsert.slice(i, i + CHUNK_SIZE);
                    const { error } = await supabase.from('skills').insert(chunk);

                    if (error) {
                        console.error(`❌ Batch Error (${i}-${i + CHUNK_SIZE}):`, error.message);
                    } else {
                        process.stdout.write('.');
                    }
                }
                console.log('\n\n✅ Import Complete! 🚀');
            } else {
                console.log('⚠️ No skills found to import.');
            }
        });
}

seedSkills().catch(e => {
    console.error('CRITICAL ERROR:', e);
    process.exit(1);
});
