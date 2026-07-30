create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  original_url text not null,
  original_path text,
  processed_url text,
  processed_path text,
  original_size bigint not null default 0,
  processed_size bigint,
  format text not null,
  width integer not null,
  height integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  image_id uuid not null references public.images(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

create index if not exists images_user_id_idx on public.images(user_id);
create index if not exists downloads_user_id_idx on public.downloads(user_id);
create index if not exists downloads_image_id_idx on public.downloads(image_id);

alter table public.users enable row level security;
alter table public.images enable row level security;
alter table public.downloads enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own images"
  on public.images for select
  using (auth.uid() = user_id);

create policy "Users can insert own images"
  on public.images for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own images"
  on public.images for delete
  using (auth.uid() = user_id);

create policy "Users can read own downloads"
  on public.downloads for select
  using (auth.uid() = user_id);

create policy "Users can insert own downloads"
  on public.downloads for insert
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 12582912, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can read their storage objects"
  on storage.objects for select
  using (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload to their storage folder"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their storage objects"
  on storage.objects for delete
  using (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Make a user admin after signup:
-- update public.users set role = 'admin' where email = 'you@example.com';
