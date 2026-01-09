-- 16_create_chat_module.sql

BEGIN;

-- 1. Create the Messages Table
CREATE TABLE IF NOT EXISTS public.academy_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0),
    channel_id TEXT DEFAULT 'general', -- Future-proofing for rooms like 'staff', 'announcements'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_messages_academy_id ON public.academy_messages(academy_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.academy_messages(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.academy_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Policy: View Messages (Only from my academy)
CREATE POLICY "Users can view messages from their academy"
ON public.academy_messages
FOR SELECT
USING (
    academy_id IN (
        SELECT academy_id FROM public.profiles
        WHERE id = auth.uid()
    )
);

-- Policy: Send Messages (Only to my academy, as myself)
CREATE POLICY "Users can send messages to their academy"
ON public.academy_messages
FOR INSERT
WITH CHECK (
    -- 1. Must match my academy
    academy_id IN (
        SELECT academy_id FROM public.profiles
        WHERE id = auth.uid()
    )
    -- 2. Sender must be me
    AND sender_id = auth.uid()
);

-- 5. Enable Realtime
-- Add table to the publication used by Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.academy_messages;

COMMIT;
