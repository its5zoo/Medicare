import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { initialBeds, type BedItem } from '@/data/bedManagementData'
import { BedDouble, ArrowUpRight, Calendar, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'medicure_hospital_beds_v1'

export function LiveBedOccupancy() {
  const [beds] = useState<BedItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback
      }
    }
    return initialBeds
  })

  const occupiedBeds = beds.filter((b) => b.status === 'Occupied')
  const availableCount = beds.filter((b) => b.status === 'Available').length

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="p-4 pb-3 md:p-6 md:pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-muted-foreground" />
            Live Bed Occupancy & Inpatients
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {occupiedBeds.length} beds occupied • {availableCount} vacant beds ready for admission
          </p>
        </div>
        <Link to="/beds">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 cursor-pointer">
            <span>View All Beds</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="pb-3 font-medium">Bed & Ward</th>
                <th className="pb-3 font-medium">Admitted Patient</th>
                <th className="pb-3 font-medium">Admitted Date</th>
                <th className="pb-3 font-medium">Doctor</th>
                <th className="pb-3 font-medium">Est. Discharge</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {occupiedBeds.slice(0, 5).map((bed) => (
                <tr key={bed.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-medium">
                    <span className="font-semibold text-foreground text-xs">{bed.bedNumber}</span>
                    <p className="text-[11px] text-muted-foreground">{bed.wardType}</p>
                  </td>
                  <td className="py-3">
                    {bed.patient ? (
                      <div>
                        <Link
                          to={`/patients/${bed.patient.patientId}`}
                          className="font-semibold text-foreground hover:underline text-xs"
                        >
                          {bed.patient.patientName}
                        </Link>
                        <div className="text-[11px] text-muted-foreground">
                          {bed.patient.patientId} • {bed.patient.age}y/{bed.patient.gender}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {bed.patient?.admittedDate}
                  </td>
                  <td className="py-3 text-xs text-foreground font-medium">
                    {bed.patient?.doctor}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {bed.patient?.expectedDischargeDate}
                  </td>
                  <td className="py-3 text-right">
                    <Link to="/beds">
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2 cursor-pointer">
                        Manage Bed
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
