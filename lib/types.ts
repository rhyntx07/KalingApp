// Shapes returned by the real KalingApp backend -- see the Django
// serializers these mirror (milkbank.serializers.FacilitySerializer,
// articles.serializers.AdminArticleSerializer / ReportedCommentSerializer,
// dashboard.views.AdminDashboardStatsView).

export interface Facility {
  id: number
  name: string
  type: 'Accredited Human Milk Bank' | 'Hospital Depot'
  contact: string
  address: string
  operating_hours: string
  donor_requirements: string
  recipient_requirements: string
  unavailable_donor_dates: string[]
  unavailable_recipient_dates: string[]
  is_operational: boolean
  capacity: number
  booked_count: number
  stock_level_ml: number
  latitude: number
  longitude: number
}

export const ARTICLE_CATEGORIES = [
  'Latching Techniques',
  'Milk Storage & Safety',
  'Maternal Nutrition',
  'Newborn Health',
] as const

export interface Article {
  id: number
  title: string
  category: string
  read_time: string
  teaser: string
  content: string
  author: string
  rating: string
  evidence_label: string
  date: string
}

export interface ReportedComment {
  id: number
  article: number
  article_title: string
  author_name: string
  text: string
  created_at: string
  is_reported: boolean
  report_reason: string
}

export interface DashboardStats {
  total_bookings: number
  total_donors: number
  total_recipients: number
  active_facilities: number
  total_articles: number
  pending_comment_reports: number
  booking_trend: { month: string; count: number }[]
  articles_by_category: { category: string; count: number }[]
  donor_status_summary: { status: string; count: number }[]
  recipient_status_summary: { status: string; count: number }[]
  // Why requests were declined, most common first. Only declines -- never
  // expired bookings. A decline with no recorded reason comes back as
  // "Not specified".
  decline_reasons: { reason: string; count: number }[]
}
