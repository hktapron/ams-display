import type { Stand, StandStatus, StandZone, FilterState } from '../types'

const STATUS_COLOR: Record<StandStatus, string> = {
  occupied:    '#22C55E',
  arriving:    '#F59E0B',
  departing:   '#3B82F6',
  delayed:     '#EF4444',
  scheduled:   '#6366F1',
  vacant:      '#334155',
  maintenance: '#94A3B8',
}

const STATUS_LABEL: Record<StandStatus, string> = {
  occupied:    'OCCUPIED',
  arriving:    'ARRIVING',
  departing:   'DEPARTING',
  delayed:     'DELAYED',
  scheduled:   'SCHEDULED',
  vacant:      'VACANT',
  maintenance: 'MAINT',
}

const ZONES: StandZone[] = ['East', 'West', 'Remote']
const STATUSES: StandStatus[] = ['occupied', 'arriving', 'departing', 'delayed', 'scheduled', 'vacant', 'maintenance']

interface LeftSidebarProps {
  stands: Stand[]
  filter: FilterState
  onFilterChange: (f: FilterState) => void
}

function countByStatus(stands: Stand[]) {
  const counts: Partial<Record<StandStatus, number>> = {}
  for (const s of stands) {
    counts[s.status] = (counts[s.status] ?? 0) + 1
  }
  return counts
}

export function LeftSidebar({ stands, filter, onFilterChange }: LeftSidebarProps) {
  const counts = countByStatus(stands)
  const total = stands.length
  const occupied = (counts.occupied ?? 0) + (counts.arriving ?? 0) + (counts.departing ?? 0) + (counts.delayed ?? 0)
  const occupancyPct = Math.round((occupied / total) * 100)

  function setZone(zone: StandZone | 'All') {
    onFilterChange({ ...filter, zone })
  }
  function setStatus(status: StandStatus | 'All') {
    onFilterChange({ ...filter, status })
  }

  return (
    <div
      className="flex flex-col h-full shrink-0"
      style={{
        width: 180,
        background: '#111827',
        borderRight: '1px solid #1E2D45',
      }}
    >
      {/* Occupancy header */}
      <div className="px-3 py-3 border-b" style={{ borderColor: '#1E2D45' }}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-sans font-semibold" style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Occupancy
          </span>
          <span className="mono font-bold" style={{ fontSize: 18, color: '#E2E8F0' }}>
            {occupancyPct}<span style={{ fontSize: 11, color: '#94A3B8' }}>%</span>
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5" style={{ background: '#1E2D45', borderRadius: 2 }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${occupancyPct}%`,
              background: occupancyPct > 80 ? '#EF4444' : occupancyPct > 60 ? '#F59E0B' : '#22C55E',
              borderRadius: 2,
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="mono" style={{ fontSize: 10, color: '#4B5563' }}>
            {occupied}/{total} stands
          </span>
          <span className="mono" style={{ fontSize: 10, color: '#4B5563' }}>
            {counts.maintenance ?? 0} maint
          </span>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="px-3 py-2.5 border-b" style={{ borderColor: '#1E2D45' }}>
        <div className="mb-2" style={{ fontSize: 10, color: '#4B5563', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Status
        </div>
        <div className="space-y-1">
          {STATUSES.map(s => {
            const cnt = counts[s] ?? 0
            if (cnt === 0) return null
            const active = filter.status === s
            return (
              <button
                key={s}
                onClick={() => setStatus(active ? 'All' : s)}
                className="flex items-center justify-between w-full px-2 h-6 transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                  borderRadius: 2,
                  border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5"
                    style={{ background: STATUS_COLOR[s], borderRadius: '50%' }}
                  />
                  <span
                    className="mono"
                    style={{ fontSize: 10, color: active ? '#E2E8F0' : '#94A3B8', letterSpacing: '0.06em' }}
                  >
                    {STATUS_LABEL[s]}
                  </span>
                </div>
                <span
                  className="mono font-semibold"
                  style={{ fontSize: 11, color: STATUS_COLOR[s] }}
                >
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
        {filter.status !== 'All' && (
          <button
            onClick={() => setStatus('All')}
            className="mt-1.5 w-full text-center transition-opacity hover:opacity-80"
            style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}
          >
            clear filter
          </button>
        )}
      </div>

      {/* Zone filter */}
      <div className="px-3 py-2.5 border-b" style={{ borderColor: '#1E2D45' }}>
        <div className="mb-2" style={{ fontSize: 10, color: '#4B5563', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Zone
        </div>
        <div className="space-y-1">
          {(['All', ...ZONES] as const).map(z => {
            const active = filter.zone === z
            const cnt = z === 'All' ? total : stands.filter(s => s.zone === z).length
            return (
              <button
                key={z}
                onClick={() => setZone(z)}
                className="flex items-center justify-between w-full px-2 h-6 transition-all"
                style={{
                  background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                  borderRadius: 2,
                  border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                }}
              >
                <span
                  className="font-sans font-medium"
                  style={{ fontSize: 11, color: active ? '#93C5FD' : '#94A3B8' }}
                >
                  {z}
                </span>
                <span
                  className="mono font-semibold"
                  style={{ fontSize: 11, color: active ? '#93C5FD' : '#4B5563' }}
                >
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mini stand grid */}
      <div className="px-3 py-2.5 flex-1 overflow-y-auto">
        <div className="mb-2" style={{ fontSize: 10, color: '#4B5563', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Stand Grid
        </div>
        {ZONES.map(zone => (
          <div key={zone} className="mb-3">
            <div
              className="mb-1.5"
              style={{ fontSize: 9, color: '#4B5563', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}
            >
              {zone}
            </div>
            <div className="flex flex-wrap gap-1">
              {stands
                .filter(s => s.zone === zone)
                .map(s => (
                  <div
                    key={s.id}
                    title={`${s.id} — ${s.status}${s.flight ? ` (${s.flight.callsign})` : ''}`}
                    className="flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 20,
                      background: `${STATUS_COLOR[s.status]}22`,
                      border: `1px solid ${STATUS_COLOR[s.status]}55`,
                      borderRadius: 2,
                      cursor: 'default',
                    }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 8, color: STATUS_COLOR[s.status], fontWeight: 600 }}
                    >
                      {s.id}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
