 -- Create app_stats table
CREATE TABLE IF NOT EXISTS app_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    downloads INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial stats
INSERT INTO app_stats (downloads, rating, active_users)
VALUES (5000, 4.9, 3500)
ON CONFLICT DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_app_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp update
CREATE TRIGGER update_app_stats_timestamp
    BEFORE UPDATE ON app_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_app_stats_updated_at();