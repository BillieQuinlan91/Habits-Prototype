create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tribes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  organization_id uuid references public.organizations(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  tribe_id uuid references public.tribes(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tribe_members (
  id uuid primary key default gen_random_uuid(),
  tribe_id uuid not null references public.tribes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  unique (tribe_id, user_id),
  unique (user_id)
);

create table if not exists public.habit_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('binary', 'measurable')),
  suggested_target_value integer,
  suggested_target_unit text,
  sort_order integer not null default 0
);

create table if not exists public.user_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('binary', 'measurable')),
  target_value integer,
  target_unit text,
  source_type text not null default 'manual',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_habit_id uuid not null references public.user_habits(id) on delete cascade,
  log_date date not null,
  completed boolean not null default false,
  progress_value integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_habit_id, log_date)
);

create table if not exists public.member_reactions (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  emoji text not null check (emoji in ('🎉', '💪', '🔥', '👏')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (from_user_id, to_user_id, week_start_date, emoji)
);

create table if not exists public.member_comments (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  message text not null check (char_length(message) <= 240),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.integration_interest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  integration_name text not null check (integration_name in ('Apple Health', 'Garmin', 'Oura', 'Whoop', 'Fitbit', 'None')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, integration_name)
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  daily_enabled boolean not null default true,
  daily_time time,
  sunday_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.enforce_tribe_member_limit()
returns trigger
language plpgsql
as $$
declare
  current_count integer;
begin
  select count(*) into current_count
  from public.tribe_members
  where tribe_id = new.tribe_id;

  if current_count >= 8 then
    raise exception 'This tribe is full.';
  end if;

  return new;
end;
$$;

drop trigger if exists tribe_member_limit_trigger on public.tribe_members;
create trigger tribe_member_limit_trigger
before insert on public.tribe_members
for each row execute procedure public.enforce_tribe_member_limit();

create or replace function public.sync_profile_from_membership()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles
    set tribe_id = new.tribe_id,
        organization_id = (select organization_id from public.tribes where id = new.tribe_id),
        updated_at = timezone('utc', now())
    where id = new.user_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.profiles
    set tribe_id = null,
        organization_id = null,
        updated_at = timezone('utc', now())
    where id = old.user_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists sync_profile_membership_insert on public.tribe_members;
create trigger sync_profile_membership_insert
after insert on public.tribe_members
for each row execute procedure public.sync_profile_from_membership();

drop trigger if exists sync_profile_membership_delete on public.tribe_members;
create trigger sync_profile_membership_delete
after delete on public.tribe_members
for each row execute procedure public.sync_profile_from_membership();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_user_habits_updated_at on public.user_habits;
create trigger set_user_habits_updated_at
before update on public.user_habits
for each row execute procedure public.set_updated_at();

drop trigger if exists set_habit_logs_updated_at on public.habit_logs;
create trigger set_habit_logs_updated_at
before update on public.habit_logs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute procedure public.set_updated_at();

create or replace view public.tribe_member_counts
with (security_invoker = on) as
select
  t.id,
  t.name,
  t.organization_id,
  o.name as organization_name,
  count(tm.user_id)::int as member_count
from public.tribes t
left join public.organizations o on o.id = t.organization_id
left join public.tribe_members tm on tm.tribe_id = t.id
group by t.id, o.name;

create or replace function public.search_tribes(search_term text default '')
returns table (
  id uuid,
  name text,
  organization_id uuid,
  organization_name text,
  member_count integer
)
language sql
security definer
set search_path = public
as $$
  select
    tmc.id,
    tmc.name,
    tmc.organization_id,
    tmc.organization_name,
    tmc.member_count
  from public.tribe_member_counts tmc
  where auth.uid() is not null
    and (
      search_term = ''
      or tmc.name ilike '%' || search_term || '%'
    )
  order by tmc.member_count asc, tmc.name asc
  limit 10;
$$;

create or replace function public.join_tribe(tribe_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_tribe uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select tribe_id into existing_tribe
  from public.profiles
  where id = auth.uid();

  if existing_tribe is not null and existing_tribe <> tribe_id_input then
    raise exception 'User already belongs to a tribe';
  end if;

  insert into public.tribe_members (tribe_id, user_id)
  values (tribe_id_input, auth.uid())
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.create_tribe_and_join(tribe_name_input text, org_id_input uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tribe_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.tribe_members where user_id = auth.uid()) then
    raise exception 'User already belongs to a tribe';
  end if;

  insert into public.tribes (name, organization_id, created_by)
  values (trim(tribe_name_input), org_id_input, auth.uid())
  returning id into new_tribe_id;

  insert into public.tribe_members (tribe_id, user_id)
  values (new_tribe_id, auth.uid());

  return new_tribe_id;
end;
$$;

create or replace function public.organization_rankings(org_id uuid)
returns table (
  tribe_id uuid,
  tribe_name text,
  organization_name text,
  score numeric,
  rank bigint,
  member_count integer
)
language sql
security definer
set search_path = public
as $$
with week_context as (
  select
    (current_date - ((extract(isodow from current_date)::int) - 1))::date as week_start,
    case
      when extract(isodow from current_date)::int = 7 then 7
      else extract(isodow from current_date)::int
    end as days_elapsed
),
member_scores as (
  select
    tm.tribe_id,
    tm.user_id,
    coalesce(
      sum(case when hl.completed then 1 else 0 end)::numeric /
      nullif((count(distinct uh.id) * (select days_elapsed from week_context))::numeric, 0),
      0
    ) as score
  from public.tribe_members tm
  left join public.user_habits uh
    on uh.user_id = tm.user_id
    and uh.is_active = true
  left join public.habit_logs hl
    on hl.user_id = tm.user_id
    and hl.user_habit_id = uh.id
    and hl.log_date >= (select week_start from week_context)
    and hl.log_date <= current_date
  group by tm.tribe_id, tm.user_id
),
tribe_scores as (
  select
    t.id as tribe_id,
    t.name as tribe_name,
    o.name as organization_name,
    count(tm.user_id)::int as member_count,
    coalesce(avg(ms.score), 0) as score
  from public.tribes t
  left join public.organizations o on o.id = t.organization_id
  left join public.tribe_members tm on tm.tribe_id = t.id
  left join member_scores ms on ms.tribe_id = t.id and ms.user_id = tm.user_id
  where t.organization_id = org_id
  group by t.id, o.name
)
select
  tribe_id,
  tribe_name,
  organization_name,
  round(score, 4) as score,
  dense_rank() over (order by score desc) as rank,
  member_count
from tribe_scores
order by score desc, tribe_name asc;
$$;

alter table public.organizations enable row level security;
alter table public.tribes enable row level security;
alter table public.profiles enable row level security;
alter table public.tribe_members enable row level security;
alter table public.habit_templates enable row level security;
alter table public.user_habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.member_reactions enable row level security;
alter table public.member_comments enable row level security;
alter table public.integration_interest enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "organizations are readable by authenticated users" on public.organizations;
create policy "organizations are readable by authenticated users"
on public.organizations for select
to authenticated
using (true);

drop policy if exists "tribes are readable by authenticated users" on public.tribes;
create policy "tribes are readable by authenticated users"
on public.tribes for select
to authenticated
using (true);

drop policy if exists "profiles are readable by tribe members" on public.profiles;
create policy "profiles are readable by tribe members"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or (
    tribe_id is not null
    and tribe_id = (select tribe_id from public.profiles where id = auth.uid())
  )
);

drop policy if exists "profiles are updateable by owner" on public.profiles;
create policy "profiles are updateable by owner"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles are insertable by owner" on public.profiles;
create policy "profiles are insertable by owner"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "tribe memberships visible to tribe members" on public.tribe_members;
create policy "tribe memberships visible to tribe members"
on public.tribe_members for select
to authenticated
using (
  user_id = auth.uid()
  or tribe_id = (select tribe_id from public.profiles where id = auth.uid())
);

drop policy if exists "habit templates are readable" on public.habit_templates;
create policy "habit templates are readable"
on public.habit_templates for select
to authenticated
using (true);

drop policy if exists "user habits are readable by tribe members" on public.user_habits;
create policy "user habits are readable by tribe members"
on public.user_habits for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles target_profile
    join public.profiles viewer_profile on viewer_profile.id = auth.uid()
    where target_profile.id = user_habits.user_id
      and viewer_profile.tribe_id is not null
      and target_profile.tribe_id = viewer_profile.tribe_id
  )
);

drop policy if exists "user habits are insertable by owner" on public.user_habits;
create policy "user habits are insertable by owner"
on public.user_habits for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user habits are updateable by owner" on public.user_habits;
create policy "user habits are updateable by owner"
on public.user_habits for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "habit logs are readable by tribe members" on public.habit_logs;
create policy "habit logs are readable by tribe members"
on public.habit_logs for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles target_profile
    join public.profiles viewer_profile on viewer_profile.id = auth.uid()
    where target_profile.id = habit_logs.user_id
      and viewer_profile.tribe_id is not null
      and target_profile.tribe_id = viewer_profile.tribe_id
  )
);

drop policy if exists "habit logs are insertable by owner" on public.habit_logs;
create policy "habit logs are insertable by owner"
on public.habit_logs for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "habit logs are updateable by owner" on public.habit_logs;
create policy "habit logs are updateable by owner"
on public.habit_logs for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "member reactions visible inside tribe" on public.member_reactions;
create policy "member reactions visible inside tribe"
on public.member_reactions for select
to authenticated
using (
  from_user_id = auth.uid()
  or to_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles actor
    join public.profiles viewer on viewer.id = auth.uid()
    where actor.id = member_reactions.to_user_id
      and actor.tribe_id = viewer.tribe_id
  )
);

drop policy if exists "member reactions insertable by owner" on public.member_reactions;
create policy "member reactions insertable by owner"
on public.member_reactions for insert
to authenticated
with check (from_user_id = auth.uid());

drop policy if exists "member comments visible inside tribe" on public.member_comments;
create policy "member comments visible inside tribe"
on public.member_comments for select
to authenticated
using (
  from_user_id = auth.uid()
  or to_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles actor
    join public.profiles viewer on viewer.id = auth.uid()
    where actor.id = member_comments.to_user_id
      and actor.tribe_id = viewer.tribe_id
  )
);

drop policy if exists "member comments insertable by owner" on public.member_comments;
create policy "member comments insertable by owner"
on public.member_comments for insert
to authenticated
with check (from_user_id = auth.uid());

drop policy if exists "integration interest visible by owner" on public.integration_interest;
create policy "integration interest visible by owner"
on public.integration_interest for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "integration interest insertable by owner" on public.integration_interest;
create policy "integration interest insertable by owner"
on public.integration_interest for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notification preferences visible by owner" on public.notification_preferences;
create policy "notification preferences visible by owner"
on public.notification_preferences for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notification preferences insertable by owner" on public.notification_preferences;
create policy "notification preferences insertable by owner"
on public.notification_preferences for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notification preferences updateable by owner" on public.notification_preferences;
create policy "notification preferences updateable by owner"
on public.notification_preferences for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant execute on function public.search_tribes(text) to authenticated;
grant execute on function public.join_tribe(uuid) to authenticated;
grant execute on function public.create_tribe_and_join(text, uuid) to authenticated;
grant execute on function public.organization_rankings(uuid) to authenticated;
