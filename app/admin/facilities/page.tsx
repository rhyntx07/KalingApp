'use client'

import { useState } from 'react'
import { mockFacilities, Facility } from '@/lib/mock-data'
import { Plus, Edit2, Trash2, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FacilityModal from '@/components/admin/facility-modal'

const supplyLevelConfig = {
  low: { label: 'Low', bg: 'bg-[#FFDAD9]', text: 'text-[#BA1A1A]' },
  adequate: { label: 'Adequate', bg: 'bg-[#FDF6E2]', text: 'text-[#D4A437]' },
  high: { label: 'High', bg: 'bg-green-100', text: 'text-green-700' },
} as const

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFacilities = facilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddFacility = () => {
    setEditingFacility(null)
    setIsModalOpen(true)
  }

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility)
    setIsModalOpen(true)
  }

  const handleDeleteFacility = (id: string) => {
    if (confirm('Are you sure you want to delete this facility?')) {
      setFacilities(facilities.filter((f) => f.id !== id))
    }
  }

  const handleSaveFacility = (facility: Facility) => {
    if (editingFacility) {
      setFacilities(
        facilities.map((f) =>
          f.id === editingFacility.id ? { ...facility, updatedAt: new Date() } : f
        )
      )
    } else {
      setFacilities([
        ...facilities,
        {
          ...facility,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
    }
    setIsModalOpen(false)
    setEditingFacility(null)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facility Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage accredited milk banking and breastfeeding support facilities
          </p>
        </div>
        <Button
          onClick={handleAddFacility}
          className="bg-primary hover:bg-[#E05F86] text-white flex items-center gap-2 rounded-xl px-6 py-2.5 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Add Facility
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[18px] border border-border p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <input
          type="text"
          placeholder="Search facilities by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => {
          const supply = supplyLevelConfig[facility.supplyLevel]
          return (
            <div key={facility.id} className="bg-white rounded-[18px] border border-border p-6 hover:border-primary/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-semibold text-foreground">{facility.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    {facility.location}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${supply.bg} ${supply.text}`}>
                  {supply.label}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  {facility.phone}
                </div>
                <div className="text-sm text-muted-foreground break-all">{facility.email}</div>
                <div className="text-sm">
                  <span className="font-medium text-foreground">Hours: </span>
                  <span className="text-muted-foreground text-xs">{facility.operatingHours}</span>
                </div>
              </div>

              <div className="mb-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Services:</p>
                <div className="flex flex-wrap gap-2">
                  {facility.services.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 bg-light-pink text-primary text-xs rounded-full font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{facility.accreditation}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditFacility(facility)}
                    className="p-2 hover:bg-light-pink rounded-xl transition text-primary"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFacility(facility.id)}
                    className="p-2 hover:bg-destructive/10 rounded-xl transition text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="bg-white rounded-[18px] border border-border px-6 py-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-muted-foreground">No facilities found matching your search.</p>
        </div>
      )}

      {/* Modal */}
      <FacilityModal
        isOpen={isModalOpen}
        facility={editingFacility}
        onClose={() => {
          setIsModalOpen(false)
          setEditingFacility(null)
        }}
        onSave={handleSaveFacility}
      />
    </div>
  )
}
