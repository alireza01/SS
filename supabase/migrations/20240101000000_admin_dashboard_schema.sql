 -- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Site settings table
create table if not exists site_settings (
    id uuid primary key default uuid_generate_v4(),
    site_name text not null default 'کتاب‌یار',
    site_description text,
    allow_registration boolean default true,
    maintenance_mode boolean default false,
    theme json default '{"primary_color": "#D29E64", "secondary_color": "#4B5563"}',
    updated_at timestamp with time zone default now()
);

-- Email settings table
create table if not exists email_settings (
    id uuid primary key default uuid_generate_v4(),
    smtp_host text,
    smtp_port integer default 587,
    smtp_username text,
    smtp_password text,
    from_email text,
    from_name text,
    updated_at timestamp with time zone default now()
);

-- Books table
create table if not exists books (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    author text,
    description text,
    cover_url text,
    language text not null default 'en',
    difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
    total_words integer default 0,
    is_published boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Words table
create table if not exists words (
    id uuid primary key default uuid_generate_v4(),
    word text not null,
    definition text not null,
    example text,
    book_id uuid references books(id) on delete cascade,
    language text not null default 'en',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Word searches tracking
create table if not exists word_searches (
    id uuid primary key default uuid_generate_v4(),
    word_id uuid references words(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    searched_at timestamp with time zone default now()
);

-- Book reads tracking
create table if not exists book_reads (
    id uuid primary key default uuid_generate_v4(),
    book_id uuid references books(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    progress integer default 0,
    completed boolean default false,
    started_at timestamp with time zone default now(),
    completed_at timestamp with time zone,
    last_read_at timestamp with time zone default now()
);

-- API keys table
create table if not exists api_keys (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    key_hash text not null unique,
    created_by uuid references auth.users(id) on delete cascade,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone default now()
);

-- User profiles with extended fields
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique,
    full_name text,
    avatar_url text,
    role text not null default 'user' check (role in ('user', 'admin')),
    is_active boolean default true,
    language_preference text default 'fa',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_books_title on books(title);
create index if not exists idx_words_word on words(word);
create index if not exists idx_word_searches_word_id on word_searches(word_id);
create index if not exists idx_book_reads_book_id on book_reads(book_id);
create index if not exists idx_book_reads_user_id on book_reads(user_id);

-- Create views for analytics
create or replace view book_statistics as
select 
    b.id as book_id,
    b.title,
    count(distinct br.user_id) as total_readers,
    count(distinct case when br.completed then br.user_id end) as completed_readers,
    avg(br.progress) as average_progress
from books b
left join book_reads br on b.id = br.book_id
group by b.id, b.title;

create or replace view word_statistics as
select 
    w.id as word_id,
    w.word,
    count(ws.id) as search_count,
    count(distinct ws.user_id) as unique_searchers
from words w
left join word_searches ws on w.id = ws.word_id
group by w.id, w.word;

-- Insert default site settings if not exists
insert into site_settings (site_name, site_description)
select 'کتاب‌یار', 'پلتفرم آموزش زبان از طریق مطالعه'
where not exists (select 1 from site_settings);

-- Functions for analytics
create or replace function get_active_readers(days integer)
returns table (
    active_users bigint,
    completion_rate numeric
) language sql as $$
    select 
        count(distinct user_id) as active_users,
        round(count(distinct case when completed then user_id end)::numeric / 
              nullif(count(distinct user_id), 0)::numeric * 100, 2) as completion_rate
    from book_reads
    where last_read_at >= now() - (days || ' days')::interval;
$$;