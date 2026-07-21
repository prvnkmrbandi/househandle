-- House Handle — Database schema (Postgres / Supabase)
-- Run this in the Supabase SQL editor, or via `psql`, to create all core tables.

create extension if not exists "uuid-ossp";

-- ========== CUSTOMERS ==========
create table customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  phone text,
  address_line1 text,
  postcode text,
  stripe_customer_id text,
  marketing_opt_in boolean default false,
  created_at timestamptz default now()
);

-- ========== PROS (tradespeople) ==========
create table pros (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique not null,
  phone text,
  trade_category text not null check (trade_category in ('plumbing','gardening','cleaning','handyman')),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  id_document_url text,
  insurance_doc_url text,
  gas_safe_number text,
  service_radius_miles integer default 8,
  base_postcode text,
  rating_avg numeric(2,1) default 0,
  stripe_account_id text,
  agreement_accepted_at timestamptz,
  agreement_version text,
  created_at timestamptz default now()
);

-- ========== AVAILABILITY ==========
create table availability (
  id uuid primary key default uuid_generate_v4(),
  pro_id uuid references pros(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null
);

-- ========== SERVICES ==========
create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null check (category in ('plumbing','gardening','cleaning','handyman')),
  fixed_price numeric(8,2),           -- null = quote after inspection
  description text,
  active boolean default true
);

-- ========== BOOKINGS ==========
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id),
  pro_id uuid references pros(id),                 -- null until matched
  service_id uuid references services(id),
  status text not null default 'requested'
    check (status in ('requested','confirmed','in_progress','completed','cancelled','no_show')),
  scheduled_start timestamptz,
  address_postcode text,
  address_line1 text,
  price_quoted numeric(8,2),
  price_final numeric(8,2),
  photo_url text,
  cancellation_reason text,
  terms_accepted_at timestamptz,
  terms_version text,
  created_at timestamptz default now()
);

-- ========== PAYMENTS ==========
create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id),
  amount numeric(8,2) not null,
  commission_amount numeric(8,2) not null,
  payout_amount numeric(8,2) not null,
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  status text not null default 'pending'
    check (status in ('pending','paid','refunded','failed')),
  paid_at timestamptz
);

-- ========== REVIEWS ==========
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ========== WAITLIST (public website sign-ups) ==========
create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  role text not null default 'customer' check (role in ('customer','pro')),
  postcode text,
  created_at timestamptz default now()
);

-- ========== SEED DATA (Coalville launch services) ==========
insert into services (name, category, fixed_price, description) values
  ('Leaking tap', 'plumbing', 45.00, 'Call-out, diagnosis and washer/part replacement'),
  ('Garden tidy-up', 'gardening', 35.00, 'Mowing, edging, general tidy-up for small/medium gardens'),
  ('Home clean', 'cleaning', 28.00, 'Standard one-off clean for a small property'),
  ('Flat-pack build', 'handyman', 30.00, 'Assembly of one standard flat-pack furniture item');

-- ========== ROW LEVEL SECURITY (Supabase) ==========
alter table customers enable row level security;
alter table pros enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table waitlist enable row level security;

-- Example policies (tighten before going live — these are starting points)
create policy "Customers see only their own record"
  on customers for select using (auth.uid()::text = id::text);

create policy "Customers see only their own bookings"
  on bookings for select using (auth.uid()::text = customer_id::text);

create policy "Pros see only bookings assigned to them"
  on bookings for select using (auth.uid()::text = pro_id::text);
