-- 1. Fix Legacy 'order' column in levels (It causes NOT NULL errors)
DO $$
BEGIN
    -- Check if column "order" exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'levels' AND column_name = 'order') THEN
        -- Make it nullable so it doesn't block inserts that use order_index
        ALTER TABLE public.levels ALTER COLUMN "order" DROP NOT NULL;
    END IF;
END $$;

-- 2. Add Metadata to Invitations
