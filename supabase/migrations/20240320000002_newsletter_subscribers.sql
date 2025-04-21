-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'unsubscribed')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_newsletter_subscribers_timestamp
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

-- Set up RLS policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view all subscribers
CREATE POLICY "Admins can view all newsletter subscribers"
    ON newsletter_subscribers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND role = 'admin'
        )
    );

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
    ON newsletter_subscribers FOR INSERT
    WITH CHECK (true);

-- Allow subscribers to unsubscribe (update their own status)
CREATE POLICY "Subscribers can update their own status"
    ON newsletter_subscribers FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM newsletter_subscribers
        WHERE id = auth.uid() AND email = NEW.email
    ))
    WITH CHECK (
        NEW.status = 'unsubscribed' AND
        EXISTS (
            SELECT 1 FROM newsletter_subscribers
            WHERE id = auth.uid() AND email = NEW.email
        )
    );

-- Grant permissions
GRANT SELECT ON newsletter_subscribers TO authenticated;
GRANT INSERT ON newsletter_subscribers TO anon, authenticated;
GRANT UPDATE (status) ON newsletter_subscribers TO authenticated; 