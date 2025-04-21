 -- Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  target_id TEXT,
  target_type VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create index for faster queries
CREATE INDEX admin_activity_logs_admin_id_idx ON admin_activity_logs(admin_id);
CREATE INDEX admin_activity_logs_created_at_idx ON admin_activity_logs(created_at);
CREATE INDEX admin_activity_logs_action_idx ON admin_activity_logs(action);

-- Create view for admin activity summary
CREATE OR REPLACE VIEW admin_activity_summary AS
SELECT
  admin_id,
  action,
  COUNT(*) as action_count,
  MIN(created_at) as first_action,
  MAX(created_at) as last_action
FROM admin_activity_logs
GROUP BY admin_id, action;

-- Create function to get admin activity stats
CREATE OR REPLACE FUNCTION get_admin_activity_stats(
  p_admin_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_actions BIGINT,
  actions_by_type JSONB,
  recent_activity JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total,
      JSONB_OBJECT_AGG(
        action,
        COUNT(*)
      ) as by_type,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'action', action,
          'details', details,
          'created_at', created_at,
          'target_type', target_type,
          'target_id', target_id
        )
        ORDER BY created_at DESC
        LIMIT 10
      ) as recent
    FROM admin_activity_logs
    WHERE 
      admin_id = p_admin_id
      AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY admin_id
  )
  SELECT
    COALESCE(total, 0),
    COALESCE(by_type, '{}'::jsonb),
    COALESCE(recent, '[]'::jsonb)
  FROM stats;
END;
$$;