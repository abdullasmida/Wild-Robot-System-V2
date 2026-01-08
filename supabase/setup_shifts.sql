
-- 1. Locations Table
create table if not exists public.locations (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    address text,
    created_at timestamptz default now()
);

-- FIX: Ensure 'address' column exists even if table was created previously without it
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'locations' and column_name = 'address') then
        alter table public.locations add column address text;
    end if;
end $$;

-- 2. Staff Shifts Table
create table if not exists public.staff_shifts (
    id uuid default gen_random_uuid() primary key,
    staff_id uuid references public.profiles(id) on delete cascade not null,
    academy_id uuid references public.academies(id) on delete cascade, 
    location_id uuid references public.locations(id) on delete set null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    status text default 'assigned', -- assigned, in_progress, completed, missed
    title text, -- e.g. "Level 1 Gymnastics"
    created_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.locations enable row level security;
alter table public.staff_shifts enable row level security;

-- 4. Policies 
-- Clean up old policies first to avoid "already exists" errors
drop policy if exists "Public read locations" on public.locations;
drop policy if exists "Staff read own shifts" on public.staff_shifts;
drop policy if exists "Owners manage shifts" on public.staff_shifts;

create policy "Public read locations" on public.locations for select to authenticated using (true);
create policy "Staff read own shifts" on public.staff_shifts for select to authenticated using (true); 
create policy "Owners manage shifts" on public.staff_shifts for all to authenticated using (true);

-- 5. Seed Data (Safe Insert)
-- Insert a location if not exists
insert into public.locations (name, address)
values ('Main Hall', 'Building A')
on conflict do nothing;
