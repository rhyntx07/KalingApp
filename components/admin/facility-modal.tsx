'use client'

import { useState, useEffect } from 'react'
import { Facility } from '@/lib/types'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type FacilityFormValues = Omit<Facility, 'id' | 'booked_count'>

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

  useEffect(() => {
    if (facility) {
      const { id, booked_count, ...rest } = facility
      setFormData(rest)
    } else {
      setFormData(emptyForm)
    }
  }, [facility, isOpen])

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
    onSave(formData)
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
