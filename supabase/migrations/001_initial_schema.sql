-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PRODUCTS TABLE (Synced from Stripe Products/Prices)
create table public.products (
  id text primary key, -- Stripe Product ID (e.g., prod_xxx)
  active boolean not null,
  name text not null,
  description text,
  image text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Allow public read-only access to products." on public.products for select using (true);

-- 2. SUBSCRIPTIONS TABLE (Synced from Stripe Subscriptions)
create type public.subscription_status as enum (
  'trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused'
);

create table public.subscriptions (
  id text primary key, -- Stripe Subscription ID (e.g., sub_xxx)
  user_id uuid references auth.users(id) on delete cascade not null,
  status public.subscription_status not null,
  metadata jsonb,
  price_id text references public.products(id),
  quantity integer not null,
  cancel_at_period_end boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  ended_at timestamp with time zone,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone
);

alter table public.subscriptions enable row level security;
create policy "Allow users to read their own subscriptions." on public.subscriptions for select using (auth.uid() = user_id);

-- 3. USERS PROFILE TABLE (Linked to Supabase Auth)
create table public.users (
  id uuid references auth.users(id) primary key,
  email text not null,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;
create policy "Allow users to view and update their own profile." on public.users for select using (auth.uid() = id);
create policy "Allow users to update their own profile." on public.users for update using (auth.uid() = id);

-- Auto-create profile on auth sign up trigger
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
