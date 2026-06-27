'use client'

import { mockStatistics, mockFacilities } from '@/lib/mock-data'
import DashboardCard from '@/components/admin/dashboard-card'
import ActivityChart from '@/components/admin/activity-chart'
import EngagementChart from '@/components/admin/engagement-chart'
import { BookOpen, MessageSquare, Building2, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = mockStatistics

  const supplyCount = {
    high: mockFacilities.filter((f) => f.supplyLevel === 'high').length,
    adequate: mockFacilities.filter((f) => f.supplyLevel === 'adequate').length,
    low: mockFacilities.filter((f) => f.supplyLevel === 'low').length,
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toLocaleString(),
      icon: TrendingUp,
      color: 'primary',
      description: 'Active bookings this month',
    },
    {
      title: 'Total Donors',
      value: stats.totalDonors.toLocaleString(),
      icon: BookOpen,
      color: 'primary',
      description: 'Registered milk donors',
    },
    {
      title: 'Total Recipients',
      value: stats.totalRecipients.toLocaleString(),
      icon: MessageSquare,
      color: 'accent',
      description: 'Active recipients',
    },
    {
      title: 'Active Facilities',
      value: stats.activeFacilities.toLocaleString(),
      icon: Building2,
      color: 'primary',
      description: 'Accredited facilities',
    },
  ]

  return (
    <div className="p-8 space-y-8">
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
        <ActivityChart data={stats.bookingTrend} />
        <EngagementChart data={stats.engagementData} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Pending Comments</h3>
          <p className="text-4xl font-bold text-accent">{stats.pendingComments}</p>
          <p className="text-sm text-muted-foreground mt-2">Awaiting moderation review</p>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Published Articles</h3>
          <p className="text-4xl font-bold text-primary">{stats.activeArticles}</p>
          <p className="text-sm text-muted-foreground mt-2">Knowledge base articles</p>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Facility Supply Level</h3>
          <div className="flex items-center gap-3 mt-2">
            {supplyCount.high > 0 && (
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                {supplyCount.high} High
              </span>
            )}
            {supplyCount.adequate > 0 && (
              <span className="px-2.5 py-1 bg-[#FDF6E2] text-accent text-sm font-semibold rounded-full">
                {supplyCount.adequate} Adequate
              </span>
            )}
            {supplyCount.low > 0 && (
              <span className="px-2.5 py-1 bg-[#FFDAD9] text-destructive text-sm font-semibold rounded-full">
                {supplyCount.low} Low
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-3">Across {stats.activeFacilities} facilities</p>
        </div>
      </div>
    </div>
  )
}
