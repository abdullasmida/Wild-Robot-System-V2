/*
  # SEED PROGRAMS 🏟️
  
  Goal: Add default sports programs requested by the user.
  Sports: Parkour, Gymnastics, Football, Swimming, Basketball, Badminton, Karate.
*/

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.academies LOOP
        
        -- 1. Parkour (Orange)
        IF NOT EXISTS (SELECT 1 FROM public.programs WHERE academy_id = r.id AND name = 'Parkour') THEN
            INSERT INTO public.programs (academy_id, name, color, tags) 
            VALUES (r.id, 'Parkour', '#f97316', '{"parkour", "agility"}');
        END IF;

        -- 2. Gymnastics (Purple)
        IF NOT EXISTS (SELECT 1 FROM public.programs WHERE academy_id = r.id AND name = 'Gymnastics') THEN
            INSERT INTO public.programs (academy_id, name, color, tags) 
            VALUES (r.id, 'Gymnastics', '#a855f7', '{"gymnastics", "flexibility"}');
        END IF;

        -- 3. Football (Green)
        IF NOT EXISTS (SELECT 1 FROM public.programs WHERE academy_id = r.id AND name = 'Football') THEN
            INSERT INTO public.programs (academy_id, name, color, tags) 
            VALUES (r.id, 'Football', '#22c55e', '{"football", "soccer", "team"}');
        END IF;

        -- 4. Swimming (Blue)
        IF NOT EXISTS (SELECT 1 FROM public.programs WHERE academy_id = r.id AND name = 'Swimming') THEN
            INSERT INTO public.programs (academy_id, name, color, tags) 
            VALUES (r.id, 'Swimming', '#3b82f6', '{"swimming", "water"}');
        END IF;

        -- 5. Basketball (Red/Orange)
        IF NOT EXISTS (SELECT 1 FROM public.programs WHERE academy_id = r.id AND name = 'Basketball') THEN
            INSERT INTO public.programs (academy_id, name, color, tags) 
            VALUES (r.id, 'Basketball', '#ea580c', '{"basketball", "team"}');
        END IF;

        -- 6. Badminton (Teal)
        IF NOT EXISTS (SELECT 1 FROM public.programs WHERE academy_id = r.id AND name = 'Badminton') THEN
            INSERT INTO public.programs (academy_id, name, color, tags) 
            VALUES (r.id, 'Badminton', '#14b8a6', '{"badminton", "racket"}');
        END IF;
        
        -- 7. Karate (Red)
        IF NOT EXISTS (SELECT 1 FROM public.programs WHERE academy_id = r.id AND name = 'Karate') THEN
            INSERT INTO public.programs (academy_id, name, color, tags) 
            VALUES (r.id, 'Karate', '#ef4444', '{"karate", "martial_arts", "fight"}');
        END IF;

    END LOOP;
END $$;
