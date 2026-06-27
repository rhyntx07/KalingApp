'use client'

import { mockStatistics } from '@/lib/mock-data'
import ActivityChart from '@/components/admin/activity-chart'
import EngagementChart from '@/components/admin/engagement-chart'
import DonorChart from '@/components/admin/donor-chart'
import RecipientChart from '@/components/admin/recipient-chart'
import { TrendingUp, Users, Heart, Building2 } from 'lucide-react'

export default function StatisticsPage() {
  const stats = mockStatistics

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Statistics & Reports</h1>
        <p className="text-muted-foreground mt-2">Comprehensive analytics and activity reports for KalingApp</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalBookings.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-primary/50" />
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Donors</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalDonors.toLocaleString()}</p>
            </div>
            <Users className="h-10 w-10 text-primary/50" />
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Recipients</p>
              <p className="text-3xl font-bold text-accent mt-2">{stats.totalRecipients.toLocaleString()}</p>
            </div>
            <Heart className="h-10 w-10 text-accent/50" />
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Facilities</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.activeFacilities}</p>
            </div>
            <Building2 className="h-10 w-10 text-primary/50" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart data={stats.bookingTrend} />
        <EngagementChart data={stats.engagementData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonorChart data={stats.donorSummary} />
        <RecipientChart data={stats.recipientSummary} />
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend Details */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Monthly Booking Trend</h3>
          <div className="space-y-3">
            {stats.bookingTrend.map((item) => (
              <div key={item.month} className="flex items-center gap-4">
                <span className="w-12 text-sm font-medium text-muted-foreground">{item.month}</span>
                <div className="flex-1 bg-light-pink/50 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${(item.count / Math.max(...stats.bookingTrend.map((m) => m.count))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Categories */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Engagement by Category</h3>
          <div className="space-y-3">
            {stats.engagementData.map((item) => (
              <div key={item.category} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground flex-1">{item.category}</span>
                <div className="flex-1">
                  <div className="bg-[#FDF6E2] rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2"
                      style={{
                        width: `${(item.count / Math.max(...stats.engagementData.map((m) => m.count))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donor Summary */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Donor Summary</h3>
          <div className="space-y-2">
            {stats.donorSummary.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 bg-light-pink/30 rounded-xl">
                <span className="text-sm text-foreground">{item.status}</span>
                <span className="text-lg font-semibold text-primary">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{stats.totalDonors}</span>
            </p>
          </div>
        </div>

        {/* Recipient Summary */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Recipient Summary</h3>
          <div className="space-y-2">
            {stats.recipientSummary.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 bg-[#FDF6E2]/50 rounded-xl">
                <span className="text-sm text-foreground">{item.status}</span>
                <span className="text-lg font-semibold text-accent">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{stats.totalRecipients}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-muted-foreground">Active Facilities</p>
          <p className="text-4xl font-bold text-primary mt-2">{stats.activeFacilities}</p>
        </div>
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-muted-foreground">Knowledge Articles</p>
          <p className="text-4xl font-bold text-primary mt-2">{stats.activeArticles}</p>
        </div>
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-muted-foreground">Pending Moderation</p>
          <p className="text-4xl font-bold text-accent mt-2">{stats.pendingComments}</p>
        </div>
      </div>
    </div>
  )
}
