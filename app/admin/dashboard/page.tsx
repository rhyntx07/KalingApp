'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { DashboardStats } from '@/lib/types'
import DashboardCard from '@/components/admin/dashboard-card'
import ActivityChart from '@/components/admin/activity-chart'
import EngagementChart from '@/components/admin/engagement-chart'
import { BookOpen, MessageSquare, Building2, TrendingUp, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch('/dashboard/stats/')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load dashboard stats (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load dashboard stats')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading dashboard...
      </div>
    )
  }

  if (loadError || !stats) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-[18px] border border-destructive/30 p-6 text-destructive">
          {loadError || 'Failed to load dashboard stats'}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.total_bookings.toLocaleString(),
      icon: TrendingUp,
      color: 'primary',
      description: 'All-time milk bank bookings',
    },
    {
      title: 'Total Donors',
      value: stats.total_donors.toLocaleString(),
      icon: BookOpen,
      color: 'primary',
      description: 'People with a donor request',
    },
    {
      title: 'Total Recipients',
      value: stats.total_recipients.toLocaleString(),
      icon: MessageSquare,
      color: 'accent',
      description: 'People with a recipient request',
    },
    {
      title: 'Active Facilities',
      value: stats.active_facilities.toLocaleString(),
      icon: Building2,
      color: 'primary',
      description: 'Currently operational',
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of KalingApp system metrics and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart data={stats.booking_trend} />
        <EngagementChart data={stats.articles_by_category} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Pending Comment Reports</h3>
          <p className="text-4xl font-bold text-accent">{stats.pending_comment_reports}</p>
          <p className="text-sm text-muted-foreground mt-2">Awaiting moderation review</p>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Knowledge Base Articles</h3>
          <p className="text-4xl font-bold text-primary">{stats.total_articles}</p>
          <p className="text-sm text-muted-foreground mt-2">Total published articles</p>
        </div>
      </div>
    </div>
  )
}
