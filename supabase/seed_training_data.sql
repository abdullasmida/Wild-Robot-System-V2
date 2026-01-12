-- SEED DATA for Training System
-- Context: Adds "USAG 2024-2025" curriculum, 4 Apparatus, and sample Skills with Media.

-- 1. Create Curriculum
INSERT INTO public.curriculums (name, version, is_active)
VALUES ('USAG Women''s Artistic', '2024-2025', true);

-- 2. Get IDs (Variable simulation in SQL is tricky, so we'll just insert and assume UUIDs or look them up if needed)
-- For this seed, we assume the Tables "levels" and "apparatus" are already populated from previous migrations.

-- 3. Insert Sample Skills (with Media)
DO $$
DECLARE
    curr_id UUID;
    floor_id UUID;
    l1_id UUID;
BEGIN
    SELECT id INTO curr_id FROM public.curriculums WHERE version = '2024-2025' LIMIT 1;
    SELECT id INTO floor_id FROM public.apparatus WHERE name = 'Floor' LIMIT 1;
    SELECT id INTO l1_id FROM public.levels WHERE name = 'Bronze' LIMIT 1; -- Taking Bronze as Level 1 equivalent for now

    IF curr_id IS NOT NULL AND floor_id IS NOT NULL THEN
        INSERT INTO public.skills (academy_id, curriculum_id, apparatus_id, level_id, name, description, video_provider_id, video_platform, preview_url)
        VALUES 
        (NULL, curr_id, floor_id, l1_id, 'Forward Roll', 'Basic tumble', 'dQw4w9WgXcQ', 'youtube', 'https://media.giphy.com/media/tXL4FHPSnVJ0A/giphy.webp'),
        (NULL, curr_id, floor_id, l1_id, 'Cartwheel', 'Sideways rotation', 'dQw4w9WgXcQ', 'youtube', 'https://media.giphy.com/media/3o7Tjq9l5j612XyqD6/giphy.webp');
    END IF;
END $$;

-- 4. Create a Drill
INSERT INTO public.drills (title, description, difficulty, video_provider_id, preview_url)
VALUES ('Handstand Hold against Wall', 'Hold for 30 seconds', 'beginner', 'dQw4w9WgXcQ', 'https://media.giphy.com/media/l0HlHJGHe3yAMhdQY/giphy.webp');

-- 5. Link Drill to Skill (Drill ID needing lookup, simplified for script)
-- (Skipping dynamic link in pure SQL seed without more complex logic, but you get the idea)
