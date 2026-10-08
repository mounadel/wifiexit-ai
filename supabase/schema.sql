-- WifiExit AI — quota journalier par utilisateur
-- À coller dans Supabase > SQL Editor > Run (une seule fois)

create table if not exists public.usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  used integer not null default 0,
  primary key (user_id, day)
);

-- Limite personnalisée par utilisateur (optionnel) : ajoute une ligne ici pour
-- donner plus (ou moins) de crédits à quelqu'un que la valeur par défaut.
create table if not exists public.user_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_limit integer not null
);

alter table public.usage_daily enable row level security;
alter table public.user_limits enable row level security;
-- Aucune policy = personne côté navigateur ne peut lire/écrire. Seul le serveur (service role) y accède.

create or replace function public.consume_credits(p_user uuid, p_amount integer, p_default_limit integer)
returns table(ok boolean, used_total integer, daily_limit integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_limit integer;
  v_used integer;
begin
  select coalesce((select l.daily_limit from public.user_limits l where l.user_id = p_user), p_default_limit)
    into v_limit;

  insert into public.usage_daily(user_id, day, used) values (p_user, v_day, 0)
    on conflict (user_id, day) do nothing;

  update public.usage_daily u
     set used = u.used + p_amount
   where u.user_id = p_user and u.day = v_day and u.used + p_amount <= v_limit
  returning u.used into v_used;

  if found then
    return query select true, v_used, v_limit;
  else
    select u.used into v_used from public.usage_daily u where u.user_id = p_user and u.day = v_day;
    return query select false, coalesce(v_used, 0), v_limit;
  end if;
end;
$$;

create or replace function public.refund_credits(p_user uuid, p_amount integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.usage_daily u
     set used = greatest(0, u.used - p_amount)
   where u.user_id = p_user and u.day = (now() at time zone 'utc')::date;
$$;

create or replace function public.get_usage(p_user uuid, p_default_limit integer)
returns table(used_total integer, daily_limit integer)
language sql
security definer
set search_path = public
as $$
  select
    coalesce((select u.used from public.usage_daily u where u.user_id = p_user and u.day = (now() at time zone 'utc')::date), 0),
    coalesce((select l.daily_limit from public.user_limits l where l.user_id = p_user), p_default_limit);
$$;

revoke all on function public.consume_credits(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.refund_credits(uuid, integer) from public, anon, authenticated;
revoke all on function public.get_usage(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_credits(uuid, integer, integer) to service_role;
grant execute on function public.refund_credits(uuid, integer) to service_role;
grant execute on function public.get_usage(uuid, integer) to service_role;
