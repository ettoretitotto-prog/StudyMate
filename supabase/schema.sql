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

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  total_xp integer not null default 0 check (total_xp >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject text not null,
  title text not null,
  description text not null,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 180),
  status text not null default 'ready' check (status in ('ready', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'failed')),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null check (requirement_type in ('missions_completed', 'total_xp', 'level')),
  requirement_value integer not null check (requirement_value > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, achievement_id)
);

create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_completed_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists missions_user_created_idx on public.missions(user_id, created_at desc);
create index if not exists study_sessions_user_status_idx on public.study_sessions(user_id, status);
create index if not exists study_sessions_completed_at_idx on public.study_sessions(completed_at);
create index if not exists users_total_xp_idx on public.users(total_xp desc);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_missions_updated_at on public.missions;
create trigger set_missions_updated_at
before update on public.missions
for each row execute function public.set_updated_at();

drop trigger if exists set_study_sessions_updated_at on public.study_sessions;
create trigger set_study_sessions_updated_at
before update on public.study_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at
before update on public.achievements
for each row execute function public.set_updated_at();

drop trigger if exists set_user_achievements_updated_at on public.user_achievements;
create trigger set_user_achievements_updated_at
before update on public.user_achievements
for each row execute function public.set_updated_at();

drop trigger if exists set_streaks_updated_at on public.streaks;
create trigger set_streaks_updated_at
before update on public.streaks
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users as target (id, name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Studente'),
    coalesce(new.email, '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(nullif(excluded.name, ''), target.name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.achievements (key, name, description, icon, requirement_type, requirement_value)
values
  ('first_step', 'Primo Passo', 'Completa 1 missione', 'Sparkles', 'missions_completed', 1),
  ('serious_student', 'Studente Serio', 'Completa 10 missioni', 'ShieldCheck', 'missions_completed', 10),
  ('xp_100_club', '100 XP Club', 'Raggiungi 100 XP', 'Trophy', 'total_xp', 100),
  ('level_up', 'Level Up', 'Raggiungi livello 5', 'Crown', 'level', 5)
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value;

alter table public.users enable row level security;
alter table public.missions enable row level security;
alter table public.study_sessions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.streaks enable row level security;

drop policy if exists "Users can read leaderboard profiles" on public.users;
create policy "Users can read leaderboard profiles"
on public.users for select
to authenticated
using (true);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own missions" on public.missions;
create policy "Users can read own missions"
on public.missions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own missions" on public.missions;
create policy "Users can insert own missions"
on public.missions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own missions" on public.missions;
create policy "Users can update own missions"
on public.missions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own study sessions" on public.study_sessions;
create policy "Users can read own study sessions"
on public.study_sessions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own study sessions" on public.study_sessions;
create policy "Users can insert own study sessions"
on public.study_sessions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own study sessions" on public.study_sessions;
create policy "Users can update own study sessions"
on public.study_sessions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read achievements" on public.achievements;
create policy "Users can read achievements"
on public.achievements for select
to authenticated
using (true);

drop policy if exists "Users can read own unlocked achievements" on public.user_achievements;
create policy "Users can read own unlocked achievements"
on public.user_achievements for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own unlocked achievements" on public.user_achievements;
create policy "Users can insert own unlocked achievements"
on public.user_achievements for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own streak" on public.streaks;
create policy "Users can read own streak"
on public.streaks for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own streak" on public.streaks;
create policy "Users can insert own streak"
on public.streaks for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own streak" on public.streaks;
create policy "Users can update own streak"
on public.streaks for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.study_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists study_maps_user_created_idx on public.study_maps(user_id, created_at desc);

drop trigger if exists set_study_maps_updated_at on public.study_maps;
create trigger set_study_maps_updated_at
before update on public.study_maps
for each row execute function public.set_updated_at();

alter table public.study_maps enable row level security;

drop policy if exists "Users can read own study maps" on public.study_maps;
create policy "Users can read own study maps"
on public.study_maps for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own study maps" on public.study_maps;
create policy "Users can insert own study maps"
on public.study_maps for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own study maps" on public.study_maps;
create policy "Users can update own study maps"
on public.study_maps for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own study maps" on public.study_maps;
create policy "Users can delete own study maps"
on public.study_maps for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  study_map_id uuid not null references public.study_maps(id) on delete cascade,
  game_type text not null check (game_type in ('drag_drop')),
  score integer not null check (score >= 0 and score <= 100),
  time_seconds integer not null check (time_seconds >= 0),
  completed boolean not null default false,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists game_sessions_user_map_idx on public.game_sessions(user_id, study_map_id, created_at desc);
create index if not exists game_sessions_score_idx on public.game_sessions(study_map_id, score desc);

drop trigger if exists set_game_sessions_updated_at on public.game_sessions;
create trigger set_game_sessions_updated_at
before update on public.game_sessions
for each row execute function public.set_updated_at();

alter table public.game_sessions enable row level security;

drop policy if exists "Users can read own game sessions" on public.game_sessions;
create policy "Users can read own game sessions"
on public.game_sessions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own game sessions" on public.game_sessions;
create policy "Users can insert own game sessions"
on public.game_sessions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own game sessions" on public.game_sessions;
create policy "Users can update own game sessions"
on public.game_sessions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
