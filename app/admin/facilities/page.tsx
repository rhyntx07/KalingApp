'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Facility } from '@/lib/types'
import { Plus, Edit2, Trash2, Phone, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FacilityModal, { FacilityFormValues } from '@/components/admin/facility-modal'

// Volumes are stored and transported in MILLILITRES everywhere -- the column is
// stock_level_mL, the API field is stock_level_ml, and the manuscript quotes
// volumes in mL -- so this is a RENDER-layer conversion only. Nothing here
// changes what is sent to or received from the backend.
//
// 3 decimal places is deliberate, not cosmetic: 1.191 L -> 1191 mL exactly, so
// the number shown in the edit form round-trips to the stored integer with no
// rounding drift. Two places would silently shift a volume by 1 mL every time
// a record was opened and saved.
function formatLitres(ml: number, decimals = 2): string {
  return `${(ml / 1000).toFixed(decimals).replace(/\.?0+$/, '')} L`
}

function stockBadge(facility: Facility) {
  // !! READ THIS BEFORE CHANGING 300 !!
  //
  // The low-stock cutoff is DUPLICATED IN TWO PLACES and this is the second
  // one. The number the Smart Allocation engine actually compares against
  // lives in the backend:
  //
  //     backend/milkbank/allocation.py
  //         MINIMUM_STOCK_THRESHOLD_ML = 300
  //
  // 300 is a PLACEHOLDER there, flagged as such in that file's own comment
  // ("nobody ... has supplied a real minimum-stock cutoff"). It is waiting to
  // be replaced with a real figure from St. Luke's / PGH / Fabella. Whoever
  // replaces it MUST change this comparison too, or the badge will disagree
  // with the engine that is actually routing mothers.
  //
  // Deliberately compared in MILLILITRES, never restated as 0.3 L: a third copy
  // in different units is harder to spot than a second copy in the same units,
  // and the display conversion above already handles units. The clean fix is a
  // single published source, which needs a config endpoint the backend does
  // not expose -- tracked as OPEN rather than silently duplicated.
  if (!facility.is_operational) return { label: 'Not Operational', bg: 'bg-muted', text: 'text-muted-foreground' }
  if (facility.stock_level_ml < 300) return { label: 'Low Stock', bg: 'bg-[#FFDAD9]', text: 'text-[#BA1A1A]' }
  return { label: formatLitres(facility.stock_level_ml), bg: 'bg-green-100', text: 'text-green-700' }
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const loadFacilities = () => {
    setIsLoading(true)
    setLoadError(null)
    apiFetch('/milkbank/facilities/')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load facilities (${res.status})`)
        return res.json()
      })
      .then(setFacilities)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load facilities'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadFacilities()
  }, [])

  const filteredFacilities = facilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddFacility = () => {
    setEditingFacility(null)
    setActionError(null)
    setIsModalOpen(true)
  }

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility)
    setActionError(null)
    setIsModalOpen(true)
  }

  const handleDeleteFacility = async (facility: Facility) => {
    if (!confirm(`Delete ${facility.name}? This cannot be undone.`)) return
    setActionError(null)
    try {
      const res = await apiFetch(`/milkbank/facilities/${facility.id}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Could not delete this facility')
      setFacilities((prev) => prev.filter((f) => f.id !== facility.id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete this facility')
    }
  }

  const handleSaveFacility = async (values: FacilityFormValues) => {
    setIsSaving(true)
    setActionError(null)
    try {
      const res = editingFacility
        ? await apiFetch(`/milkbank/facilities/${editingFacility.id}/`, {
            method: 'PATCH',
            body: JSON.stringify(values),
          })
        : await apiFetch('/milkbank/facilities/', {
            method: 'POST',
            body: JSON.stringify(values),
          })
      if (!res.ok) throw new Error('Could not save this facility')
      const saved: Facility = await res.json()
      setFacilities((prev) =>
        editingFacility ? prev.map((f) => (f.id === saved.id ? saved : f)) : [...prev, saved]
      )
      setIsModalOpen(false)
      setEditingFacility(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save this facility')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
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

      {actionError && (
        <div className="bg-white rounded-[18px] border border-destructive/30 p-4 text-destructive text-sm">
          {actionError}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-[18px] border border-border p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <input
          type="text"
          placeholder="Search facilities by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[18px] border border-border px-6 py-12 text-center text-muted-foreground flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading facilities...
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-[18px] border border-destructive/30 px-6 py-12 text-center text-destructive shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {loadError}
          <div className="pt-3">
            <Button onClick={loadFacilities} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-2">
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((facility) => {
              const badge = stockBadge(facility)
              return (
                <div key={facility.id} className="bg-white rounded-[18px] border border-border p-6 hover:border-primary/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-2">
                      <h3 className="text-lg font-semibold text-foreground">{facility.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {facility.address}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      {facility.contact}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Hours: </span>
                      <span className="text-muted-foreground text-xs">{facility.operating_hours}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Bookings: </span>
                      <span className="text-muted-foreground text-xs">
                        {facility.booked_count} / {facility.capacity}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 pt-4 border-t border-border">
                    <span className="px-2 py-1 bg-light-pink text-primary text-xs rounded-full font-medium">
                      {facility.type}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditFacility(facility)}
                      className="p-2 hover:bg-light-pink rounded-xl transition text-primary"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(facility)}
                      className="p-2 hover:bg-destructive/10 rounded-xl transition text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
        </>
      )}

      {/* Modal */}
      <FacilityModal
        isOpen={isModalOpen}
        facility={editingFacility}
        isSaving={isSaving}
        onClose={() => {
          setIsModalOpen(false)
          setEditingFacility(null)
        }}
        onSave={handleSaveFacility}
      />
    </div>
  )
}
