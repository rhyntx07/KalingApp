'use client'

import { useState, useEffect } from 'react'
import { Facility, SupplyLevel } from '@/lib/mock-data'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FacilityModalProps {
  isOpen: boolean
  facility: Facility | null
  onClose: () => void
  onSave: (facility: Facility) => void
}

const availableServices = [
  'Milk Collection',
  'Donor Screening',
  'Milk Processing',
  'Distribution',
  'Testing',
  'Storage',
  'Education',
  'Support Groups',
  'Evaluation',
  'Processing & Pasteurization',
  'Microbiological Quality Control Testing',
  'Safe Storage & Distribution',
]

export default function FacilityModal({ isOpen, facility, onClose, onSave }: FacilityModalProps) {
  const [formData, setFormData] = useState<Partial<Facility>>({
    name: '',
    location: '',
    phone: '',
    email: '',
    services: [],
    supplyLevel: 'adequate',
    operatingHours: '',
    accreditation: '',
  })

  useEffect(() => {
    if (facility) {
      setFormData(facility)
    } else {
      setFormData({
        name: '',
        location: '',
        phone: '',
        email: '',
        services: [],
        supplyLevel: 'adequate',
        operatingHours: '',
        accreditation: '',
      })
    }
  }, [facility, isOpen])

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const services = prev.services || []
      return {
        ...prev,
        services: services.includes(service)
          ? services.filter((s) => s !== service)
          : [...services, service],
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name ||
      !formData.location ||
      !formData.phone ||
      !formData.email ||
      !formData.services ||
      formData.services.length === 0
    ) {
      alert('Please fill in all required fields and select at least one service')
      return
    }

    const newFacility: Facility = {
      id: facility?.id || '',
      name: formData.name,
      location: formData.location,
      phone: formData.phone,
      email: formData.email,
      services: formData.services,
      supplyLevel: (formData.supplyLevel as SupplyLevel) || 'adequate',
      operatingHours: formData.operatingHours || '',
      accreditation: formData.accreditation || '',
      createdAt: facility?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    onSave(newFacility)
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
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Facility name"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="City, Region"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+63-XX-XXXX-XXXX"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="contact@facility.com"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Supply Level</label>
              <select
                name="supplyLevel"
                value={formData.supplyLevel || 'adequate'}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                <option value="low">Low</option>
                <option value="adequate">Adequate</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Accreditation</label>
              <input
                type="text"
                name="accreditation"
                value={formData.accreditation || ''}
                onChange={handleChange}
                placeholder="DOH Licensed"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Operating Hours</label>
            <input
              type="text"
              name="operatingHours"
              value={formData.operatingHours || ''}
              onChange={handleChange}
              placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
              className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Services Provided *</label>
            <div className="grid grid-cols-2 gap-3">
              {availableServices.map((service) => (
                <label key={service} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services?.includes(service) || false}
                    onChange={() => handleServiceToggle(service)}
                    className="w-4 h-4 rounded border-border bg-white accent-primary"
                  />
                  <span className="text-sm text-foreground">{service}</span>
                </label>
              ))}
            </div>
          </div>

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
              className="px-6 py-2.5 bg-primary hover:bg-[#E05F86] text-white rounded-xl transition-all duration-200"
            >
              {facility ? 'Update Facility' : 'Create Facility'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
