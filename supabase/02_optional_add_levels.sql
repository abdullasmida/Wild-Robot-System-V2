-- OPTIONAL: Run this if you want some default levels to start with
-- Replace 'YOUR_ACADEMY_ID' with your actual Academy ID if you know it, 
-- OR if you are the only owner, this subquery tries to aid you:

INSERT INTO public.levels (academy_id, name, order_index)
SELECT id, 'Beginner', 1 FROM academies LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.levels (academy_id, name, order_index)
SELECT id, 'Intermediate', 2 FROM academies LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.levels (academy_id, name, order_index)
SELECT id, 'Advanced', 3 FROM academies LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.levels (academy_id, name, order_index)
SELECT id, 'Elite', 4 FROM academies LIMIT 1
ON CONFLICT DO NOTHING;
