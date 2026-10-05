'use client'

import { useState, useEffect } from 'react'
import { Facility } from '@/lib/types'
import { apiFetch } from '@/lib/api'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// staff_user_id / new_staff_email / new_staff_password are write-only on
// the backend (milkbank.serializers.FacilitySerializer) and never come
// back in a GET -- they don't belong on the Facility type itself (which
// mirrors the read shape everywhere else in this app), only on what
// this modal is allowed to POST.
export type FacilityFormValues = Omit<Facility, 'id' | 'booked_count'> & {
  staff_user_id?: number
  new_staff_email?: string
  new_staff_password?: string
}

type StaffAssignMode = 'none' | 'existing' | 'new'

// Just enough of accounts.serializers.AdminUserListSerializer's shape
// to build the "assign existing account" dropdown -- this modal already
// has no business reading a mother's booking totals or any other field
// that endpoint returns.
interface StaffAccountOption {
  id: number
  email: string
  role: string
  is_staff: boolean
  facility_name: string | null
}

interface FacilityModalProps {
  isOpen: boolean
  facility: Facility | null
  onClose: () => void
  onSave: (values: FacilityFormValues) => void
  isSaving: boolean
}

const emptyForm: FacilityFormValues = {
  name: '',
  type: 'Hospital Depot',
  contact: '',
  address: '',
  operating_hours: '8:00 AM - 5:00 PM (Mon-Fri)',
  donor_requirements: '',
  recipient_requirements: '',
  unavailable_donor_dates: [],
  unavailable_recipient_dates: [],
  is_operational: true,
  capacity: 10,
  stock_level_ml: 0,
  latitude: 0,
  longitude: 0,
}

export default function FacilityModal({ isOpen, facility, onClose, onSave, isSaving }: FacilityModalProps) {
  const [formData, setFormData] = useState<FacilityFormValues>(emptyForm)

  // Staffing is a create-time-only convenience (see FacilitySerializer.
  // create() on the backend -- editing never touches it), kept as its
  // own state rather than folded into formData since none of it is a
  // real Facility field.
  const [staffMode, setStaffMode] = useState<StaffAssignMode>('none')
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffPassword, setNewStaffPassword] = useState('')
  const [staffFieldError, setStaffFieldError] = useState<string | null>(null)
  const [unassignedStaff, setUnassignedStaff] = useState<StaffAccountOption[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)

  useEffect(() => {
    if (facility) {
      const { id, booked_count, ...rest } = facility
      setFormData(rest)
    } else {
      setFormData(emptyForm)
    }
    setStaffMode('none')
    setSelectedStaffId('')
    setNewStaffEmail('')
    setNewStaffPassword('')
    setStaffFieldError(null)
  }, [facility, isOpen])

  useEffect(() => {
    // Only worth fetching for a brand-new facility -- editing never
    // shows this section at all (see the JSX below).
    if (!isOpen || facility) return
    setIsLoadingStaff(true)
    apiFetch('/auth/admin/users/')
      .then((res) => (res.ok ? res.json() : []))
      .then((users: StaffAccountOption[]) => {
        setUnassignedStaff(users.filter((u) => u.role === 'facility_staff' && !u.is_staff && !u.facility_name))
      })
      .catch(() => setUnassignedStaff([]))
      .finally(() => setIsLoadingStaff(false))
  }, [isOpen, facility])

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? 0 : Number(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.address || !formData.contact) {
      alert('Please fill in name, address, and contact')
      return
    }

    const payload: FacilityFormValues = { ...formData }
    if (!facility) {
      if (staffMode === 'existing') {
        if (!selectedStaffId) {
          setStaffFieldError('Choose a staff account, or switch back to "No staff account yet".')
          return
        }
        payload.staff_user_id = Number(selectedStaffId)
      } else if (staffMode === 'new') {
        if (!newStaffEmail || !newStaffPassword) {
          setStaffFieldError('Enter both an email and a password for the new staff account.')
          return
        }
        if (newStaffPassword.length < 8) {
          setStaffFieldError('The password needs to be at least 8 characters.')
          return
        }
        payload.new_staff_email = newStaffEmail
        payload.new_staff_password = newStaffPassword
      }
    }
    setStaffFieldError(null)
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-border px-8 py-6 flex items-center justify-between rounded-t-[20px]">
          <h2 className="text-2xl font-bold text-foreground">
            {facility ? 'Edit Facility' : 'Add New Facility'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-light-pink rounded-xl transition-all duration-200 text-muted-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Facility Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Facility name"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                <option value="Accredited Human Milk Bank">Accredited Human Milk Bank</option>
                <option value="Hospital Depot">Hospital Depot</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, City, Region"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contact *</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Phone or email"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Operating Hours</label>
              <input
                type="text"
                name="operating_hours"
                value={formData.operating_hours}
                onChange={handleChange}
                placeholder="Mon-Fri: 8AM-5PM"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Booking Capacity</label>
              <input
                type="number"
                name="capacity"
                min={0}
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Milk Stock (Litres)</label>
              {/* Shown in litres, stored in millilitres. The field name stays
                  stock_level_ml because that is what the API accepts, and the
                  x1000 on change is the only place the conversion happens.
                  step=0.001 makes the round-trip exact -- 1.191 L -> 1191 mL --
                  so opening a record and saving it unchanged cannot shift the
                  stored volume. At 2dp it would drift by 1 mL every save. */}
              <input
                type="number"
                name="stock_level_ml"
                min={0}
                step={0.001}
                value={formData.stock_level_ml / 1000}
                onChange={(e) => {
                  const litres = e.target.value === '' ? 0 : Number(e.target.value)
                  setFormData((prev) => ({ ...prev, stock_level_ml: Math.round(litres * 1000) }))
                }}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Stored as {formData.stock_level_ml.toLocaleString()} mL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Latitude</label>
              <input
                type="number"
                name="latitude"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Longitude</label>
              <input
                type="number"
                name="longitude"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Donor Requirements</label>
            <textarea
              name="donor_requirements"
              value={formData.donor_requirements}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Recipient Requirements</label>
            <textarea
              name="recipient_requirements"
              value={formData.recipient_requirements}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_operational"
              checked={formData.is_operational}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border bg-white accent-primary"
            />
            <span className="text-sm text-foreground">Operational</span>
          </label>

          {/* Staff Account -- create-time only. Editing an existing
              facility never shows this: reassigning its staff mid-edit
              is a bigger, more disruptive decision (that account's
              current facility loses its only login) than this section
              is meant for, and the backend only ever acts on these
              fields from a POST anyway (see FacilitySerializer.create()). */}
          {!facility && (
            <div className="rounded-xl border border-border p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Staff Account</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Optional. Nobody can sign in to this facility&apos;s dashboard until a
                  facility-staff account is assigned to it -- do that now, or leave it for later.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['none', 'No staff account yet'],
                    ['existing', 'Assign existing account'],
                    ['new', 'Create new account'],
                  ] as [StaffAssignMode, string][]
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setStaffMode(mode)
                      setStaffFieldError(null)
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      staffMode === mode
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-light-pink/50 hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {staffMode === 'existing' &&
                (isLoadingStaff ? (
                  <p className="text-sm text-muted-foreground">Loading staff accounts...</p>
                ) : unassignedStaff.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No facility-staff accounts are currently unassigned. Use &quot;Create new account&quot; instead.
                  </p>
                ) : (
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                  >
                    <option value="">Select a staff account...</option>
                    {unassignedStaff.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                ))}

              {staffMode === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="staff@hospital.ph"
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Temporary Password</label>
                    {/* Plain text, not type="password" -- deliberately
                        visible so whoever's filling this in can actually
                        relay it to the facility afterward. There's no
                        "send setup email" flow behind this yet; the
                        admin is the one handing the credential over. */}
                    <input
                      type="text"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                </div>
              )}

              {staffFieldError && <p className="text-xs text-destructive">{staffFieldError}</p>}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white hover:bg-light-pink border-2 border-primary text-primary rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-[#E05F86] text-white rounded-xl transition-all duration-200 disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : facility ? 'Update Facility' : 'Create Facility'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
