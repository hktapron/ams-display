import React from 'react'
import {
  ChevronDown, ChevronRight, ChevronUp,
  Download, Search, X, Zap, Fuel, Monitor
} from 'lucide-react'
import type { Stand, StandStatus, SortKey, SortDir, FilterState } from '../types'

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<StandStatus, string> = {
  occupied:    '#22C55E',
  arriving:    '#F59E0B',
  departing:   '#3B82F6',
  delayed:     '#EF4444',
  scheduled:   '#6366F1',
  vacant:      '#334155',
  maintenance: '#94A3B8',
}

const STATUS_BG: Record<StandStatus, string> = {
  occupied:    'rgba(34,197,94,0.12)',
  arriving:    'rgba(245,158,11,0.12)',
  departing:   'rgba(59,130,246,0.12)',
  delayed:     'rgba(239,68,68,0.12)',
  scheduled:   'rgba(99,102,241,0.12)',
  vacant:      'rgba(51,65,85,0.20)',
  maintenance: 'rgba(148,163,184,0.10)',
}

const STATUS_LABEL: Record<StandStatus, string> = {
  occupied:    'OCCUPIED',
  arriving:    'ARRIVING',
  departing:   'DEPARTING',
  delayed:     'DELAYED',
  scheduled:   'SCHED',
  vacant:      'VACANT',
  maintenance: 'MAINT',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCountdown(ms: number): { label: string; color: string } {
  const abs = Math.abs(ms)
  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const s = Math.floor((abs % 60000) / 1000)
  const sign = ms < 0 ? '-' : '+'
  const color = ms < 0 ? '#EF4444' : ms < 10 * 60000 ? '#F59E0B' : '#22C55E'
  if (h > 0) return { label: `${sign}${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, color }
  return { label: `${sign}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, color }
}

// ── Gantt timeline ───────────────────────────────────────────────────────────

interface GanttProps {
  stand: Stand
  nowMs: number
}

function GanttTimeline({ stand, nowMs }: GanttProps) {
  const WINDOW_MINS = 6 * 60  // 6-hour window centered on now
  const HALF = WINDOW_MINS / 2
  const startMs = nowMs - HALF * 60000
  const endMs = nowMs + HALF * 60000
  const total = endMs - startMs

  function pct(ms: number) {
    return ((ms - startMs) / total) * 100
  }

  // Tick marks every 60 min
  const ticks: number[] = []
  for (let i = -3; i <= 3; i++) {
    ticks.push(nowMs + i * 3600000)
  }

  const hasBlock = stand.occupiedSinceMs && stand.occupiedUntilMs
  const barLeft = hasBlock ? Math.max(0, pct(stand.occupiedSinceMs!)) : 0
  const barRight = hasBlock ? Math.min(100, pct(stand.occupiedUntilMs!)) : 0
  const barWidth = Math.max(0, barRight - barLeft)
  const blockColor = STATUS_COLOR[stand.status] ?? '#334155'

  const nowPct = pct(nowMs)

  return (
    <div
      className="px-4 py-3 border-b"
      style={{ background: '#0B0F1A', borderColor: '#1E2D45' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans font-semibold" style={{ fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Stand Timeline — 6-hour window
        </span>
        {stand.flight && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>Aircraft:</span>
              <span className="mono font-semibold" style={{ fontSize: 11, color: '#E2E8F0' }}>{stand.flight.aircraftReg}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>Route:</span>
              <span className="mono font-semibold" style={{ fontSize: 11, color: '#E2E8F0' }}>{stand.flight.origin} → {stand.flight.destination}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>PAX:</span>
              <span className="mono font-semibold" style={{ fontSize: 11, color: '#E2E8F0' }}>{stand.flight.pax}</span>
            </div>
          </div>
        )}
      </div>

      {/* Gantt bar area */}
      <div className="relative" style={{ height: 32 }}>
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ background: '#111827', borderRadius: 2, border: '1px solid #1E2D45' }}
        />

        {/* Tick lines + labels */}
        {ticks.map((t, i) => {
          const p = pct(t)
          if (p < 0 || p > 100) return null
          const d = new Date(t)
          const label = `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`
          return (
            <React.Fragment key={i}>
              <div
                className="absolute top-0 bottom-0 w-px"
                style={{ left: `${p}%`, background: '#1E2D45' }}
              />
              <span
                className="absolute top-1 mono"
                style={{
                  left: `${p}%`,
                  fontSize: 8,
                  color: '#4B5563',
                  transform: 'translateX(-50%)',
                  letterSpacing: 0,
                }}
              >
                {label}Z
              </span>
            </React.Fragment>
          )
        })}

        {/* Flight block */}
        {hasBlock && barWidth > 0 && (
          <div
            className="gantt-bar"
            style={{
              left: `${barLeft}%`,
              width: `${barWidth}%`,
              background: `${blockColor}22`,
              border: `1px solid ${blockColor}55`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 4,
              overflow: 'hidden',
            }}
          >
            <span
              className="mono font-semibold whitespace-nowrap"
              style={{ fontSize: 9, color: blockColor }}
            >
              {stand.flight?.callsign ?? stand.maintenanceNote ?? ''}
            </span>
          </div>
        )}

        {/* Now marker */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: `${nowPct}%`, background: '#3B82F6', zIndex: 10 }}
        />
        <div
          className="absolute"
          style={{
            left: `${nowPct}%`,
            top: 0,
            width: 5,
            height: 5,
            background: '#3B82F6',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11,
          }}
        />
      </div>

      {/* Services row */}
      <div className="flex items-center gap-4 mt-2">
        <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Services:</span>
        <ServiceBadge icon={<Zap size={9} />} label="JB" active={stand.services.jetbridge} />
        <ServiceBadge icon={<Fuel size={9} />} label="FUEL" active={stand.services.fuel} />
        <ServiceBadge icon={<Monitor size={9} />} label="GPU" active={stand.services.gpu} />
        <ServiceBadge icon={null} label="WATER" active={stand.services.water} />
        <ServiceBadge icon={null} label="PUSHBACK" active={stand.services.pushback} />
        <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
          Size limit: <span className="mono font-bold" style={{ color: '#E2E8F0' }}>{stand.sizeLimit}</span>
        </span>
        {stand.maintenanceNote && (
          <span style={{ fontSize: 10, color: '#F59E0B', fontFamily: 'Inter, sans-serif' }}>
            {stand.maintenanceNote}
          </span>
        )}
      </div>
    </div>
  )
}

function ServiceBadge({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5"
      style={{
        background: active ? 'rgba(34,197,94,0.10)' : 'rgba(75,85,99,0.20)',
        border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : '#1E2D45'}`,
        borderRadius: 2,
      }}
    >
      {icon && <span style={{ color: active ? '#22C55E' : '#4B5563' }}>{icon}</span>}
      <span
        className="mono"
        style={{ fontSize: 9, color: active ? '#86EFAC' : '#4B5563', letterSpacing: '0.06em', fontWeight: 600 }}
      >
        {label}
      </span>
    </div>
  )
}

// ── Main table ───────────────────────────────────────────────────────────────

interface StandTableProps {
  stands: Stand[]
  filter: FilterState
  onFilterChange: (f: FilterState) => void
  onExportCSV: () => void
}

function useTick() {
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return tick
}

export function StandTable({ stands, filter, onFilterChange, onExportCSV }: StandTableProps) {
  const tick = useTick()
  const nowMs = Date.now()

  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({ key: 'id', dir: 'asc' })

  function toggleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  // Filter
  const filtered = stands.filter(s => {
    if (filter.zone !== 'All' && s.zone !== filter.zone) return false
    if (filter.status !== 'All' && s.status !== filter.status) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      const match =
        s.id.toLowerCase().includes(q) ||
        s.flight?.callsign.toLowerCase().includes(q) ||
        s.flight?.aircraftType.toLowerCase().includes(q) ||
        s.flight?.airline.toLowerCase().includes(q) ||
        s.flight?.origin.toLowerCase().includes(q) ||
        s.flight?.destination.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = 0
    let bv: string | number = 0
    switch (sort.key) {
      case 'id': av = a.id; bv = b.id; break
      case 'status': av = a.status; bv = b.status; break
      case 'callsign': av = a.flight?.callsign ?? ''; bv = b.flight?.callsign ?? ''; break
      case 'aircraft': av = a.flight?.aircraftType ?? ''; bv = b.flight?.aircraftType ?? ''; break
      case 'sta': av = a.flight?.sta ?? ''; bv = b.flight?.sta ?? ''; break
      case 'std': av = a.flight?.std ?? ''; bv = b.flight?.std ?? ''; break
      case 'countdown':
        av = a.occupiedUntilMs ?? 9999999999
        bv = b.occupiedUntilMs ?? 9999999999
        break
    }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sort.dir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ k }: { k: SortKey }) {
    if (sort.key !== k) return <ChevronDown size={10} style={{ color: '#4B5563' }} />
    return sort.dir === 'asc'
      ? <ChevronUp size={10} style={{ color: '#3B82F6' }} />
      : <ChevronDown size={10} style={{ color: '#3B82F6' }} />
  }

  function ColHeader({ label, k }: { label: string; k: SortKey }) {
    return (
      <button
        onClick={() => toggleSort(k)}
        className="flex items-center gap-1 transition-opacity hover:opacity-80"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <span style={{ fontSize: 10, color: sort.key === k ? '#93C5FD' : '#94A3B8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <SortIcon k={k} />
      </button>
    )
  }

  // void tick to suppress unused warning — tick triggers re-render for countdown
  void tick

  return (
    <div className="flex flex-col h-full" style={{ background: '#0B0F1A' }}>
      {/* Table toolbar */}
      <div
        className="flex items-center justify-between px-4 h-10 shrink-0"
        style={{ background: '#111827', borderBottom: '1px solid #1E2D45' }}
      >
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-2.5 h-7"
            style={{ background: '#0B0F1A', borderRadius: 2, border: '1px solid #1E2D45' }}
          >
            <Search size={11} style={{ color: '#4B5563' }} />
            <input
              type="text"
              placeholder="Search stand, callsign, type..."
              value={filter.search}
              onChange={e => onFilterChange({ ...filter, search: e.target.value })}
              className="bg-transparent outline-none mono"
              style={{ fontSize: 11, color: '#E2E8F0', width: 200 }}
            />
            {filter.search && (
              <button onClick={() => onFilterChange({ ...filter, search: '' })}>
                <X size={10} style={{ color: '#4B5563' }} />
              </button>
            )}
          </div>

          <span className="mono" style={{ fontSize: 11, color: '#4B5563' }}>
            {sorted.length}/{stands.length} stands
          </span>
        </div>

        {/* Export */}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-2.5 h-7 transition-opacity hover:opacity-80"
          style={{
            background: '#0B0F1A',
            borderRadius: 2,
            border: '1px solid #1E2D45',
          }}
        >
          <Download size={11} style={{ color: '#94A3B8' }} />
          <span className="font-sans font-semibold" style={{ fontSize: 11, color: '#94A3B8' }}>Export CSV</span>
        </button>
      </div>

      {/* Header row */}
      <div
        className="flex items-center shrink-0 px-4"
        style={{
          height: 32,
          background: '#111827',
          borderBottom: '1px solid #1E2D45',
        }}
      >
        <div style={{ width: 18 }} />  {/* expand toggle */}
        <div style={{ width: 52 }}><ColHeader label="Stand" k="id" /></div>
        <div style={{ width: 28 }} /> {/* zone indicator */}
        <div style={{ width: 100 }}><ColHeader label="Status" k="status" /></div>
        <div style={{ width: 90 }}><ColHeader label="Callsign" k="callsign" /></div>
        <div style={{ width: 72 }}><ColHeader label="Type" k="aircraft" /></div>
        <div style={{ width: 82 }}>
          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
            Route
          </span>
        </div>
        <div style={{ width: 68 }}><ColHeader label="STA" k="sta" /></div>
        <div style={{ width: 68 }}><ColHeader label="STD" k="std" /></div>
        <div style={{ width: 90 }}><ColHeader label="Countdown" k="countdown" /></div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
            Services
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map(stand => {
          const isExpanded = expandedId === stand.id
          const hasConflict = stand.conflict

          // Countdown to next event
          let countdownLabel = '—'
          let countdownColor = '#4B5563'
          if (stand.status === 'arriving') {
            const etaStr = stand.flight?.eta
            const etaMs = etaStr
              ? (() => {
                  const [h, m] = etaStr.split(':').map(Number)
                  const d = new Date()
                  d.setUTCHours(h, m, 0, 0)
                  return d.getTime()
                })()
              : null
            if (etaMs !== null) {
              const cd = formatCountdown(etaMs - nowMs)
              countdownLabel = cd.label + ' ARR'
              countdownColor = cd.color
            }
          } else if (stand.occupiedUntilMs) {
            const cd = formatCountdown(stand.occupiedUntilMs - nowMs)
            countdownLabel = cd.label + ' DEP'
            countdownColor = cd.color
          }

          return (
            <React.Fragment key={stand.id}>
              <div
                className={`stand-row flex items-center px-4 cursor-pointer ${isExpanded ? 'expanded' : ''}`}
                style={{
                  background: isExpanded
                    ? '#111827'
                    : hasConflict
                    ? 'rgba(239,68,68,0.04)'
                    : undefined,
                  borderLeft: hasConflict ? '2px solid #EF4444' : '2px solid transparent',
                }}
                onClick={() => setExpandedId(isExpanded ? null : stand.id)}
              >
                {/* Expand toggle */}
                <div style={{ width: 18 }}>
                  {isExpanded
                    ? <ChevronDown size={12} style={{ color: '#3B82F6' }} />
                    : <ChevronRight size={12} style={{ color: '#4B5563' }} />}
                </div>

                {/* Stand ID */}
                <div style={{ width: 52 }}>
                  <span className="mono font-bold" style={{ fontSize: 13, color: '#E2E8F0' }}>
                    {stand.id}
                  </span>
                </div>

                {/* Zone dot */}
                <div style={{ width: 28 }}>
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: stand.zone === 'East' ? '#3B82F6' : stand.zone === 'West' ? '#8B5CF6' : '#F59E0B',
                    }}
                    title={stand.zone}
                  />
                </div>

                {/* Status pill */}
                <div style={{ width: 100 }}>
                  <span
                    className="status-pill"
                    style={{
                      background: STATUS_BG[stand.status],
                      color: STATUS_COLOR[stand.status],
                      border: `1px solid ${STATUS_COLOR[stand.status]}33`,
                    }}
                  >
                    {stand.status === 'maintenance' || stand.status === 'delayed' ? (
                      <span className={stand.status === 'delayed' ? 'blink' : ''}>●</span>
                    ) : (
                      <span>●</span>
                    )}
                    {STATUS_LABEL[stand.status]}
                  </span>
                </div>

                {/* Callsign */}
                <div style={{ width: 90 }}>
                  {stand.flight ? (
                    <span className="mono font-semibold" style={{ fontSize: 12, color: '#93C5FD' }}>
                      {stand.flight.callsign}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#4B5563' }}>—</span>
                  )}
                </div>

                {/* Aircraft type */}
                <div style={{ width: 72 }}>
                  {stand.flight ? (
                    <span className="mono" style={{ fontSize: 11, color: '#94A3B8' }}>
                      {stand.flight.aircraftType}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#4B5563' }}>—</span>
                  )}
                </div>

                {/* Route */}
                <div style={{ width: 82 }}>
                  {stand.flight ? (
                    <span className="mono" style={{ fontSize: 11, color: '#94A3B8' }}>
                      {stand.flight.origin}
                      <span style={{ color: '#4B5563' }}> / </span>
                      {stand.flight.destination}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#4B5563' }}>—</span>
                  )}
                </div>

                {/* STA */}
                <div style={{ width: 68 }}>
                  {stand.flight ? (
                    <div>
                      <div className="mono" style={{ fontSize: 11, color: '#E2E8F0' }}>{stand.flight.sta}</div>
                      {stand.flight.eta && stand.flight.eta !== stand.flight.sta && (
                        <div className="mono" style={{ fontSize: 9, color: '#F59E0B' }}>E {stand.flight.eta}</div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#4B5563' }}>—</span>
                  )}
                </div>

                {/* STD */}
                <div style={{ width: 68 }}>
                  {stand.flight ? (
                    <div>
                      <div className="mono" style={{ fontSize: 11, color: '#E2E8F0' }}>{stand.flight.std}</div>
                      {stand.flight.etd && stand.flight.etd !== stand.flight.std && (
                        <div className="mono" style={{ fontSize: 9, color: '#F59E0B' }}>E {stand.flight.etd}</div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#4B5563' }}>—</span>
                  )}
                </div>

                {/* Countdown */}
                <div style={{ width: 90 }}>
                  <span className="mono font-semibold" style={{ fontSize: 11, color: countdownColor }}>
                    {countdownLabel}
                  </span>
                </div>

                {/* Services mini icons */}
                <div className="flex items-center gap-1">
                  {stand.services.jetbridge && (
                    <span title="Jetbridge" style={{ fontSize: 9, color: '#22C55E', fontFamily: 'mono' }}>JB</span>
                  )}
                  {stand.services.fuel && (
                    <span title="Fuel" style={{ fontSize: 9, color: '#3B82F6', fontFamily: 'mono' }}>FL</span>
                  )}
                  {stand.services.gpu && (
                    <span title="GPU" style={{ fontSize: 9, color: '#8B5CF6', fontFamily: 'mono' }}>GPU</span>
                  )}
                  {stand.services.pushback && (
                    <span title="Pushback" style={{ fontSize: 9, color: '#F59E0B', fontFamily: 'mono' }}>PB</span>
                  )}
                </div>
              </div>

              {/* Expanded Gantt timeline */}
              {isExpanded && (
                <GanttTimeline stand={stand} nowMs={nowMs} />
              )}
            </React.Fragment>
          )
        })}

        {sorted.length === 0 && (
          <div className="flex items-center justify-center" style={{ height: 120, color: '#4B5563', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
            No stands match current filters
          </div>
        )}
      </div>
    </div>
  )
}
