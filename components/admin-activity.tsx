import { createServerClient } from "@/lib/supabase/server"

interface ActivityLogEntry {
  action: string
  created_at: string
}

export interface AdminAction {
  action: string
  adminId: string
  details: Record<string, any>
  targetId?: string
  targetType?: string
}

export async function trackAdminAction(action: AdminAction) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('admin_activity_logs')
    .insert({
      action: action.action,
      admin_id: action.adminId,
      details: action.details,
      target_id: action.targetId,
      target_type: action.targetType,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error tracking admin action:', error)
  }
}

export async function getAdminActivityStats(adminId: string, days: number = 30) {
  const supabase = createServerClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select('action, created_at')
    .eq('admin_id', adminId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin activity:', error)
    return {
      totalActions: 0,
      actionsByType: {},
      recentActivity: []
    }
  }

  const actionsByType = (data as ActivityLogEntry[]).reduce((acc: Record<string, number>, curr) => {
    acc[curr.action] = (acc[curr.action] || 0) + 1
    return acc
  }, {})

  return {
    totalActions: data.length,
    actionsByType,
    recentActivity: data.slice(0, 10)
  }
}

interface CountResponse {
  count: number | null
}

export async function getSystemStats() {
  const supabase = createServerClient()
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalAdminsResult,
    activeAdminsResult,
    { data: activityData }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('is_active', true),
    supabase
      .from('admin_activity_logs')
      .select('action, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
  ])

  const activityByDay = (activityData as ActivityLogEntry[])?.reduce((acc: Record<string, number>, curr) => {
    const day = new Date(curr.created_at).toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {}) || {}

  return {
    totalAdmins: totalAdminsResult.count || 0,
    activeAdmins: activeAdminsResult.count || 0,
    activityByDay,
    totalActivities: activityData?.length || 0
  }
} 