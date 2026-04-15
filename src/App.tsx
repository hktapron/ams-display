import React from 'react'
import { TopBar } from './components/TopBar'
import { LeftSidebar } from './components/LeftSidebar'
import { StandTable } from './components/StandTable'
import { RightPanel } from './components/RightPanel'
import { getMockStands, getMockAlerts } from './data/mock'
import type { FilterState, Stand, Alert } from './types'

// Refresh mock data every 30 seconds to simulate live updates
function useStands(): [Stand[], () => void] {
  const [stands, setStands] = React.useState<Stand[]>(() => getMockStands())
  const refresh = React.useCallback(() => setStands(getMockStands()), [])

  React.useEffect(() => {
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [refresh])

  return [stands, refresh]
}

function exportCSV(stands: Stand[]) {
  const headers = [
    'Stand', 'Zone', 'Status', 'Size Limit',
    'Callsign', 'Airline', 'Aircraft Type', 'Registration',
    'Origin', 'Destination', 'STA (UTC)', 'ETA (UTC)', 'STD (UTC)', 'ETD (UTC)',
    'PAX', 'Jetbridge', 'Fuel', 'GPU', 'Water', 'Pushback',
    'Maintenance Note',
  ]

  const rows = stands.map(s => [
    s.id,
    s.zone,
    s.status,
    s.sizeLimit,
    s.flight?.callsign ?? '',
    s.flight?.airlineName ?? '',
    s.flight?.aircraftType ?? '',
    s.flight?.aircraftReg ?? '',
    s.flight?.origin ?? '',
    s.flight?.destination ?? '',
    s.flight?.sta ?? '',
    s.flight?.eta ?? '',
    s.flight?.std ?? '',
    s.flight?.etd ?? '',
    s.flight?.pax ?? '',
    s.services.jetbridge ? 'Y' : 'N',
    s.services.fuel ? 'Y' : 'N',
    s.services.gpu ? 'Y' : 'N',
    s.services.water ? 'Y' : 'N',
    s.services.pushback ? 'Y' : 'N',
    s.maintenanceNote ?? '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ams-stands-${new Date().toISOString().substring(0, 16).replace('T', '_').replace(':', '')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [stands, refreshStands] = useStands()
  const [alerts] = React.useState<Alert[]>(() => getMockAlerts())
  const [showAlerts, setShowAlerts] = React.useState(false)
  const [filter, setFilter] = React.useState<FilterState>({
    zone: 'All',
    status: 'All',
    search: '',
  })

  void refreshStands

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#0B0F1A', color: '#E2E8F0' }}
    >
      {/* Top bar */}
      <TopBar alerts={alerts} onAlertsClick={() => setShowAlerts(v => !v)} />

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <LeftSidebar
          stands={stands}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* Main stand table */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <StandTable
            stands={stands}
            filter={filter}
            onFilterChange={setFilter}
            onExportCSV={() => exportCSV(stands)}
          />
        </div>

        {/* Right panel */}
        <RightPanel
          stands={stands}
          alerts={alerts}
          showAlerts={showAlerts}
        />
      </div>
    </div>
  )
}
