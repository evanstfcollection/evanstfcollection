-- Evan's TF Collection: add Movie Reference to existing figures table
alter table public.figures
add column if not exists movie_reference text;
