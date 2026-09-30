-- Evan's TF Collection: Supabase schema + public image storage
create extension if not exists pgcrypto;

create table if not exists public.figures (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Autobots','Decepticons','Masterpiece Movie','3rd Party','The Primes')),
  name text not null, manufacturer text, toy_line text, series text,
  year integer, alternate_mode text, scale text, condition text, notes text,
  sort_order integer not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.figure_images (
  id uuid primary key default gen_random_uuid(),
  figure_id uuid not null references public.figures(id) on delete cascade,
  storage_path text not null, image_type text not null default 'gallery',
  sort_order integer not null default 0, alt_text text, created_at timestamptz not null default now()
);
create index if not exists figures_category_idx on public.figures(category);
create index if not exists figures_name_idx on public.figures(name);
create index if not exists figure_images_figure_id_idx on public.figure_images(figure_id);

alter table public.figures enable row level security;
alter table public.figure_images enable row level security;

drop policy if exists "Published figures are publicly readable" on public.figures;
create policy "Published figures are publicly readable" on public.figures for select using (is_published = true);
drop policy if exists "Authenticated users manage figures" on public.figures;
create policy "Authenticated users manage figures" on public.figures for all to authenticated using (true) with check (true);

drop policy if exists "Published figure images are publicly readable" on public.figure_images;
create policy "Published figure images are publicly readable" on public.figure_images for select using (
  exists (select 1 from public.figures f where f.id = figure_images.figure_id and f.is_published = true)
);
drop policy if exists "Authenticated users manage figure images" on public.figure_images;
create policy "Authenticated users manage figure images" on public.figure_images for all to authenticated using (true) with check (true);

insert into storage.buckets (id,name,public) values ('tf-collection','tf-collection',true)
on conflict (id) do update set public=true;

drop policy if exists "Public can view TF collection images" on storage.objects;
create policy "Public can view TF collection images" on storage.objects for select using (bucket_id='tf-collection');
drop policy if exists "Authenticated users upload TF collection images" on storage.objects;
create policy "Authenticated users upload TF collection images" on storage.objects for insert to authenticated with check (bucket_id='tf-collection');
drop policy if exists "Authenticated users update TF collection images" on storage.objects;
create policy "Authenticated users update TF collection images" on storage.objects for update to authenticated using (bucket_id='tf-collection') with check (bucket_id='tf-collection');
drop policy if exists "Authenticated users delete TF collection images" on storage.objects;
create policy "Authenticated users delete TF collection images" on storage.objects for delete to authenticated using (bucket_id='tf-collection');

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists figures_set_updated_at on public.figures;
create trigger figures_set_updated_at before update on public.figures for each row execute function public.set_updated_at();