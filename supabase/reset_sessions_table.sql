-- ================================================================
-- 🚀 WILD ROBOT MASTER SCRIPT (V4.0 - FINAL FOUNDATION)
-- ================================================================
-- هذا السكريبت يقوم بإعادة بناء قاعدة البيانات بالكامل
-- ويدعم الشات، الأدوار المتعددة، وجدول الحصص الحقيقي.
-- ================================================================

-- 1. التنظيف الشامل (CLEANUP)
-- بنمسح الجداول القديمة عشان نبدأ على نظافة
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.active_sessions CASCADE;
-- ملاحظة: مش هنمسح جدول profiles عشان منبوظش الـ Auth Links، بس هنحدثه.

-- 2. تعريف الأدوار (ENUMS & ROLES)
DO $$ BEGIN
    -- إنشاء نوع البيانات للأدوار لو مش موجود
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'super_admin',  -- المالك
            'manager',      -- مدير النشاط
            'hr',           -- الموارد البشرية
            'head_coach',   -- المدير الفني
            'coach',        -- المدرب
            'accountant',   -- المحاسب
            'sales_admin',  -- المبيعات
            'athlete',      -- الطالب
            'parent'        -- ولي الأمر
        );
    ELSE
        -- لو النوع موجود، بنحاول نضيف القيم الجديدة (Postgres workaround)
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null; -- تجاهل الخطأ لو القيمة موجودة
END $$;

DO $$ BEGIN
    CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'excused', 'late');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. تحديث جدول البروفايل (PROFILES TABLE)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role public.app_role DEFAULT 'coach', -- الدور الافتراضي
    branch TEXT DEFAULT 'Main Branch',
    avatar_url TEXT,
    max_allowed_devices INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل الأمان (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان:
-- 1. أي حد يقدر يقرا بيانات البروفايل (عشان الشات والمنشن)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- 2. اليوزر يقدر يعدل بياناته هو بس
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. جدول الشات (MESSAGES TABLE) 💬
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id), -- لو NULL يبقى رسالة جماعية
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- سياسة الشات: أشوف رسايلي والرسايل اللي مبعوتالي والرسايل العامة
DROP POLICY IF EXISTS "Users see their own chats" ON public.messages;
CREATE POLICY "Users see their own chats" ON public.messages 
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR receiver_id IS NULL);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- 5. جدول الحصص (SESSIONS & ENROLLMENTS) 📅
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    coach_id UUID REFERENCES public.profiles(id),
    branch TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    level TEXT,
    max_capacity INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view sessions" ON public.sessions;
CREATE POLICY "Public view sessions" ON public.sessions FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.attendance_status DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(session_id, student_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coaches manage enrollments" ON public.enrollments;
CREATE POLICY "Coaches manage enrollments" ON public.enrollments FOR ALL USING (true); 


-- 6. جلسات الأمان (ACTIVE SESSIONS) 🛡️
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_agent TEXT,
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage own sessions" ON public.active_sessions;
CREATE POLICY "Manage own sessions" ON public.active_sessions FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- 🌱 زراعة البيانات (SEED DATA) - عشان نجرب فوراً
-- ================================================================

-- 1. إضافة مدرب (Coach) - لو اليوزر موجود بنحدث دوره
INSERT INTO public.profiles (id, email, full_name, role, branch)
VALUES 
    ('0036e85b-c82b-4f12-b43f-2a2d49dd4ffa', 'coach@wildrobot.com', 'Captain Majed', 'coach', 'Ajman Academy')
ON CONFLICT (id) DO UPDATE SET role = 'coach', full_name = 'Captain Majed';

-- 2. إضافة طالب (Student)
INSERT INTO public.profiles (id, email, full_name, role, branch)
VALUES 
    ('3555c4b2-f51b-4e88-9522-3455deeac3d0', 'student@wildrobot.com', 'Hero Student', 'athlete', 'Ajman Academy')
ON CONFLICT (id) DO UPDATE SET role = 'athlete', full_name = 'Hero Student';

-- 3. إضافة حصص للأسبوع ده (Real Schedule)
INSERT INTO public.sessions (id, title, coach_id, branch, start_time, end_time, level)
VALUES 
    (gen_random_uuid(), 'Elite Gymnastics', '0036e85b-c82b-4f12-b43f-2a2d49dd4ffa', 'Ajman Academy', now() + interval '2 hours', now() + interval '3 hours', 'Level 3'),
    (gen_random_uuid(), 'Swimming Basics', '0036e85b-c82b-4f12-b43f-2a2d49dd4ffa', 'Sharjah Branch', now() + interval '1 day', now() + interval '1 day 2 hours', 'Level 1');

-- 4. تسجيل الطالب في الحصة الأولى
INSERT INTO public.enrollments (session_id, student_id, status)
SELECT id, '3555c4b2-f51b-4e88-9522-3455deeac3d0', 'present'
FROM public.sessions LIMIT 1;

-- 5. رسالة شات تجريبية
INSERT INTO public.messages (sender_id, content)
VALUES ('0036e85b-c82b-4f12-b43f-2a2d49dd4ffa', 'Welcome to Wild Robot System! 🤖');
