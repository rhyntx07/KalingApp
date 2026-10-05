'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { Eye, Trash2, X, Search, Loader2, Users as UsersIcon, ShieldCheck, Building2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Every account in the system -- mothers, facility staff, and other
// admins -- from GET /auth/admin/users/ (accounts.serializers.
// AdminUserListSerializer). Distinct from the facility dashboard's own
// /admin/users page, which only ever sees mothers (its backend endpoint,
// StaffUserListView, filters role=MOTHER and is reachable by
// facility_staff accounts, not admins).
interface AdminUser {
  id: number
  email: string
  role: 'mother' | 'facility_staff'
  is_staff: boolean
  is_superuser: boolean
  facility: number | null
  facility_name: string | null
  mom_name: string
  baby_name: string
  baby_age_weeks: number | null
  total_drawn_ml: number
  total_received_ml: number
  location_consent_given: boolean
  is_active: boolean
  date_joined: string
  last_login: string | null
}

// is_staff decides this FIRST, ahead of the `role` field -- the seeded
// platform-admin account (see Backend_KalingApp/accounts/management/
// commands/ensure_admin.py) is is_staff=True with role="facility_staff"
// on purpose, specifically so it does NOT show up as a real facility
// account elsewhere. Checking role first here would mislabel it.
function roleLabel(user: AdminUser): 'Admin' | 'Facility Staff' | 'Mother' {
  if (user.is_staff) return 'Admin'
  if (user.role === 'facility_staff') return 'Facility Staff'
  return 'Mother'
}

function roleBadge(user: AdminUser) {
  const label = roleLabel(user)
  const styles: Record<typeof label, string> = {
    Admin: 'bg-[#FDF6E2] text-[#D4A437]',
    'Facility Staff': 'bg-[#E3F2FD] text-[#1565C0]',
    Mother: 'bg-light-pink text-primary',
  }
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[label]}`}>{label}</span>
  )
}

function statusBadge(isActive: boolean) {
  return isActive ? (
    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>
  ) : (
    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#FFDAD9] text-destructive">Inactive</span>
  )
}

function formatAmount(amountMl: number): string {
  return `${amountMl.toLocaleString()} mL`
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function UserManagementPage() {
  const { admin } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadUsers = () => {
    setIsLoading(true)
    setLoadError(null)
    apiFetch('/auth/admin/users/')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load accounts (${res.status})`)
        return res.json()
      })
      .then(setUsers)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load accounts'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      user.mom_name.toLowerCase().includes(query) ||
      (user.facility_name || '').toLowerCase().includes(query)
    )
  })

  const motherCount = users.filter((u) => roleLabel(u) === 'Mother').length
  const staffCount = users.filter((u) => roleLabel(u) === 'Facility Staff').length
  const adminCount = users.filter((u) => roleLabel(u) === 'Admin').length

  // The backend also refuses this (AdminUserDeleteView.perform_destroy),
  // so this is a convenience that skips the round trip and the
  // confusing "delete succeeded?" confirm dialog for an action that was
  // always going to fail -- not the only thing stopping it.
  const isSelf = (user: AdminUser) => admin !== null && String(user.id) === admin.id

  const handleDelete = async (user: AdminUser) => {
    if (isSelf(user)) return
    if (!confirm(`Permanently delete ${user.email}? This also deletes everything tied to this account -- bookings, chat history, notifications and comments. This cannot be undone.`)) {
      return
    }
    setActionError(null)
    setDeletingId(user.id)
    try {
      const res = await apiFetch(`/auth/admin/users/${user.id}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Could not delete this account')
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      if (detailsUser?.id === user.id) setDetailsUser(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete this account')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Every account on the platform -- mothers, facility staff, and admins
        </p>
      </div>

      {actionError && (
        <div className="bg-white rounded-[18px] border border-destructive/30 p-4 text-destructive text-sm">
          {actionError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-3xl font-bold text-foreground mt-2">{isLoading ? '—' : users.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-primary/50" />
          </div>
        </div>
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mothers</p>
              <p className="text-3xl font-bold text-primary mt-2">{isLoading ? '—' : motherCount}</p>
            </div>
            <Heart className="h-8 w-8 text-primary/50" />
          </div>
        </div>
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Facility Staff</p>
              <p className="text-3xl font-bold text-[#1565C0] mt-2">{isLoading ? '—' : staffCount}</p>
            </div>
            <Building2 className="h-8 w-8 text-[#1565C0]/50" />
          </div>
        </div>
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-3xl font-bold text-[#D4A437] mt-2">{isLoading ? '—' : adminCount}</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-[#D4A437]/50" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[18px] border border-border p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-[18px] border border-border px-6 py-12 text-center text-muted-foreground flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading accounts...
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-[18px] border border-destructive/30 px-6 py-12 text-center text-destructive shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {loadError}
          <div className="pt-3">
            <Button onClick={loadUsers} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-2">
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[18px] border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Facility</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium text-foreground">{user.mom_name || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">{roleBadge(user)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user.facility_name || '—'}</td>
                      <td className="px-6 py-4">{statusBadge(user.is_active)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(user.date_joined)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailsUser(user)}
                            className="p-2 hover:bg-light-pink rounded-xl transition text-primary"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isSelf(user) || deletingId === user.id}
                            className="p-2 hover:bg-destructive/10 rounded-xl transition text-destructive disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            title={isSelf(user) ? "You can't delete your own account" : 'Delete account'}
                          >
                            {deletingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No accounts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details */}
      {detailsUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] border border-border max-w-md w-full max-h-[90vh] overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-5 flex items-center justify-between rounded-t-[20px]">
              <div>
                <h2 className="text-xl font-bold text-foreground">{detailsUser.mom_name || detailsUser.email}</h2>
                <p className="text-sm text-muted-foreground">{detailsUser.email}</p>
              </div>
              <button
                onClick={() => setDetailsUser(null)}
                className="p-2 hover:bg-light-pink rounded-xl transition text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{roleBadge(detailsUser)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{statusBadge(detailsUser.is_active)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Superuser</span><span>{detailsUser.is_superuser ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{formatDate(detailsUser.date_joined)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last login</span><span>{formatDate(detailsUser.last_login)}</span></div>

              {roleLabel(detailsUser) === 'Facility Staff' && (
                <div className="flex justify-between"><span className="text-muted-foreground">Facility</span><span>{detailsUser.facility_name || 'Not assigned'}</span></div>
              )}

              {roleLabel(detailsUser) === 'Mother' && (
                <>
                  <div className="pt-3 mt-3 border-t border-border" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Baby's name</span><span>{detailsUser.baby_name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total donated</span><span>{formatAmount(detailsUser.total_drawn_ml)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total received</span><span>{formatAmount(detailsUser.total_received_ml)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Location shared</span><span>{detailsUser.location_consent_given ? 'Yes' : 'No'}</span></div>
                </>
              )}
            </div>

            <div className="px-6 pb-6 flex items-center justify-between gap-3">
              <Button
                onClick={() => handleDelete(detailsUser)}
                disabled={isSelf(detailsUser) || deletingId === detailsUser.id}
                className="bg-[#FFDAD9] hover:bg-destructive/20 text-destructive rounded-xl px-4 py-2 disabled:opacity-40"
                title={isSelf(detailsUser) ? "You can't delete your own account" : undefined}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <Button variant="outline" onClick={() => setDetailsUser(null)} className="rounded-xl px-4 py-2">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
