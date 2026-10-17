-- Run once in the Supabase SQL editor. Only explicitly listed users can edit.
create table if not exists public.portfolio_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.portfolio_admins enable row level security;
create policy "Read own editor membership" on public.portfolio_admins for select to authenticated using (user_id = auth.uid());
create or replace function public.is_portfolio_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists (select 1 from public.portfolio_admins where user_id = auth.uid()); $$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;
create table if not exists public.portfolio_projects (
 id text primary key, slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null check(length(trim(title)) between 1 and 150), category text not null,
 year integer not null check(year between 2000 and 2100), cover text not null, alt text not null,
 description text not null check(length(trim(description)) > 0), problem text not null default '', solution text not null default '',
 stack jsonb not null default '[]' check(jsonb_typeof(stack)='array'),
 links jsonb not null default '[]' check(jsonb_typeof(links)='array'),
 gallery jsonb not null default '[]' check(jsonb_typeof(gallery)='array'),
 published boolean not null default false, sort_order integer not null default 0 check(sort_order >= 0)
);
alter table public.portfolio_projects enable row level security;
create policy "Public published projects" on public.portfolio_projects for select to anon,authenticated using (published or public.is_portfolio_admin());
create policy "Editors insert projects" on public.portfolio_projects for insert to authenticated with check (public.is_portfolio_admin());
create policy "Editors update projects" on public.portfolio_projects for update to authenticated using (public.is_portfolio_admin()) with check(public.is_portfolio_admin());
create policy "Editors delete projects" on public.portfolio_projects for delete to authenticated using (public.is_portfolio_admin());
grant select on public.portfolio_projects to anon,authenticated;
grant insert,update,delete on public.portfolio_projects to authenticated;
grant select on public.portfolio_admins to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('portfolio-media','portfolio-media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
create policy "Editors upload images" on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and public.is_portfolio_admin());
