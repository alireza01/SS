 -- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial testimonials
INSERT INTO testimonials (name, role, content, is_active) VALUES
(
    'سارا محمدی',
    'دانشجوی زبان انگلیسی',
    'کتاب‌یار به من کمک کرد تا با اعتماد به نفس بیشتری کتاب‌های انگلیسی را مطالعه کنم. دیگر نیازی نیست برای هر کلمه‌ای که نمی‌دانم به دیکشنری مراجعه کنم.',
    true
),
(
    'علی رضایی',
    'مدرس زبان انگلیسی',
    'به عنوان یک مدرس زبان، کتاب‌یار را به تمام دانش‌آموزانم توصیه می‌کنم. این پلتفرم با ارائه معانی دقیق و توضیحات کامل، به یادگیری عمیق‌تر کلمات کمک می‌کند.',
    true
),
(
    'مریم حسینی',
    'مترجم',
    'کتاب‌یار با ارائه ترجمه‌های دقیق و حفظ مفهوم اصلی متن، تجربه خواندن کتاب‌های انگلیسی را برای من لذت‌بخش‌تر کرده است.',
    true
)
ON CONFLICT DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp update
CREATE TRIGGER update_testimonials_timestamp
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_updated_at();