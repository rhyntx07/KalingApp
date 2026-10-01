'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { DashboardStats } from '@/lib/types'
import ActivityChart from '@/components/admin/activity-chart'
import EngagementChart from '@/components/admin/engagement-chart'
import DonorChart from '@/components/admin/donor-chart'
import RecipientChart from '@/components/admin/recipient-chart'
import { TrendingUp, Users, Heart, Building2, Loader2, FileDown } from 'lucide-react'

export default function StatisticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch('/dashboard/stats/')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load statistics (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load statistics')
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
        <Loader2 className="h-5 w-5 animate-spin" /> Loading statistics...
      </div>
    )
  }

  if (loadError || !stats) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-[18px] border border-destructive/30 p-6 text-destructive">
          {loadError || 'Failed to load statistics'}
        </div>
      </div>
    )
  }

  // The PDF is built from the numbers already on screen (no second
  // request), so the file always matches what the admin was looking at.
  // Imported on click rather than at the top of the file: the PDF library
  // is only needed by someone who actually presses the button.
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)
    setPdfError(null)
    try {
      const { downloadStatisticsPdf } = await import('@/lib/statistics-pdf')
      downloadStatisticsPdf(stats)
    } catch {
      setPdfError('Could not generate the PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const maxBooking = Math.max(1, ...stats.booking_trend.map((m) => m.count))
  const maxEngagement = Math.max(1, ...stats.articles_by_category.map((m) => m.count))

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Statistics & Reports</h1>
          <p className="text-muted-foreground mt-2">Comprehensive analytics and activity reports for KalingApp</p>
        </div>
        <button
          type="button"
          onClick={handleGeneratePdf}
          disabled={isGeneratingPdf}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 shrink-0"
        >
          {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>

      {pdfError && (
        <div className="bg-white rounded-[18px] border border-destructive/30 p-4 text-sm text-destructive">
          {pdfError}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.total_bookings.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-primary/50" />
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Donors</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.total_donors.toLocaleString()}</p>
            </div>
            <Users className="h-10 w-10 text-primary/50" />
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Recipients</p>
              <p className="text-3xl font-bold text-accent mt-2">{stats.total_recipients.toLocaleString()}</p>
            </div>
            <Heart className="h-10 w-10 text-accent/50" />
          </div>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Facilities</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.active_facilities}</p>
            </div>
            <Building2 className="h-10 w-10 text-primary/50" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart data={stats.booking_trend} />
        <EngagementChart data={stats.articles_by_category} />
      </div>

      {/* Charts Row 2 -- each pie renders its own empty state */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonorChart data={stats.donor_status_summary} />
        <RecipientChart data={stats.recipient_status_summary} />
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend Details */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Monthly Booking Trend</h3>
          {stats.booking_trend.length > 0 ? (
            <div className="space-y-3">
              {stats.booking_trend.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="w-12 text-sm font-medium text-muted-foreground">{item.month}</span>
                  <div className="flex-1 bg-light-pink/50 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${(item.count / maxBooking) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No bookings yet</p>
          )}
        </div>

        {/* Content Categories */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Articles by Category</h3>
          {stats.articles_by_category.length > 0 ? (
            <div className="space-y-3">
              {stats.articles_by_category.map((item) => (
                <div key={item.category} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex-1">{item.category}</span>
                  <div className="flex-1">
                    <div className="bg-[#FDF6E2] rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2"
                        style={{ width: `${(item.count / maxEngagement) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No articles yet</p>
          )}
        </div>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donor Summary */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Donor Status Summary</h3>
          {stats.donor_status_summary.length > 0 ? (
            <div className="space-y-2">
              {stats.donor_status_summary.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 bg-light-pink/30 rounded-xl">
                  <span className="text-sm text-foreground">{item.status}</span>
                  <span className="text-lg font-semibold text-primary">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No donor bookings yet</p>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Total donors: <span className="font-semibold text-foreground">{stats.total_donors}</span>
            </p>
          </div>
        </div>

        {/* Recipient Summary */}
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="font-semibold text-foreground mb-4">Recipient Status Summary</h3>
          {stats.recipient_status_summary.length > 0 ? (
            <div className="space-y-2">
              {stats.recipient_status_summary.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 bg-[#FDF6E2]/50 rounded-xl">
                  <span className="text-sm text-foreground">{item.status}</span>
                  <span className="text-lg font-semibold text-accent">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recipient bookings yet</p>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Total recipients: <span className="font-semibold text-foreground">{stats.total_recipients}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
