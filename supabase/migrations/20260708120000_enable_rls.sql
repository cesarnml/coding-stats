-- Enable RLS on all public tables. Data tables stay publicly readable
-- (codingstats.vercel.app is a public dashboard); writes now go through
-- the service_role client (src/lib/supabase/serviceClient.ts) used by the
-- cron endpoints, which bypasses RLS entirely, so no anon/authenticated
-- write policies are needed on them.

alter table public.durations enable row level security;
alter table public.durations_by_language enable row level security;
alter table public.project_summaries enable row level security;
alter table public.projects enable row level security;
alter table public.summaries enable row level security;
alter table public.profiles enable row level security;

create policy "Public read access" on public.durations
  for select to anon, authenticated using (true);

create policy "Public read access" on public.durations_by_language
  for select to anon, authenticated using (true);

create policy "Public read access" on public.project_summaries
  for select to anon, authenticated using (true);

create policy "Public read access" on public.projects
  for select to anon, authenticated using (true);

create policy "Public read access" on public.summaries
  for select to anon, authenticated using (true);

-- profiles is not part of the public dashboard: only the owning user
-- (via /account) may see or edit their own row. handle_new_user() is
-- SECURITY DEFINER and bypasses RLS, so signup is unaffected.
create policy "Users can view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
