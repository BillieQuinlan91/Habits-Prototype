create table if not exists public.habit_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_habit_id uuid not null references public.user_habits(id) on delete cascade,
  milestone_phase text not null check (milestone_phase in ('day_7', 'day_30', 'day_75')),
  unlocked_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_habit_id, milestone_phase)
);

alter table public.habit_milestones enable row level security;

create policy "Users can read their own habit milestones"
on public.habit_milestones
for select
using (auth.uid() = user_id);

create policy "Users can insert their own habit milestones"
on public.habit_milestones
for insert
with check (auth.uid() = user_id);
