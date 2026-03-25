alter table public.profiles
  add column if not exists identity_label text,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.user_habits
  add column if not exists minimum_label text,
  add column if not exists is_primary boolean not null default false,
  add column if not exists commitment_start_date date,
  add column if not exists commitment_length_days integer;

update public.user_habits
set is_primary = true
where id in (
  select distinct on (user_id) id
  from public.user_habits
  where is_active = true
  order by user_id, created_at asc
);

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

  if current_count >= 6 then
    raise exception 'This circle is full.';
  end if;

  return new;
end;
$$;
