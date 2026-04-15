import React from 'react'
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import type { Stand, Alert } from '../types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseUTCTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setUTCHours(h, m, 0, 0)
  // If the parsed time is more than 12 hours in the past, assume it's tomorrow
  if (Date.now() - d.getTime() > 12 * 3600000) {
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return d
}

function minsUntil(hhmm: string): number {
  return (parseUTCTime(hhmm).getTime() - Date.now()) / 60000
}

const SEVERITY_COLOR = {
  critical: '#EF4444',
  warn:     '#F59E0B',
  info:     '#3B82F6',
}

const SEVERITY_BG = {
  critical: 'rgba(239,68,68,0.08)',
  warn:     'rgba(245,158,11,0.08)',
  info:     'rgba(59,130,246,0.08)',
}

// ── Departures chart data ─────────────────────────────────────────────────────

function buildDepartureChart(stands: Stand[]): { hour: string; count: number }[] {
  const buckets: Record<number, number> = {}
  const now = new Date()
  const baseHour = now.getUTCHours()

  for (let i = 0; i < 8; i++) {
    buckets[(baseHour + i) % 24] = 0
  }

  for (const stand of stands) {
    const std = stand.flight?.std
    if (!std) continue
    const [h] = std.split(':').map(Number)
    const delta = (h - baseHour + 24) % 24
    if (delta < 8) {
      buckets[(baseHour + delta) % 24]++
    }
  }

  return Object.entries(buckets).map(([h, count]) => ({
    hour: `${String(h).padStart(2,'0')}:00`,
    count,
  }))
}

// ── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A2235', border: '1px solid #1E2D45', borderRadius: 2, padding: '4px 8px' }}>
      <span className="mono" style={{ fontSize: 11, color: '#E2E8F0' }}>
        {payload[0].value} dep
      </span>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

interface RightPanelProps {
  stands: Stand[]
  alerts: Alert[]
  showAlerts: boolean
}

function useTick() {
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])
  return tick
}

export function RightPanel({ stands, alerts, showAlerts }: RightPanelProps) {
  const tick = useTick()
  void tick

  // Arrivals in next 90 min
  const arrivals = stands
    .filter(s => {
      const t = s.flight?.eta ?? s.flight?.sta
      if (!t) return false
      const mins = minsUntil(t)
      return mins > -10 && mins < 90
    })
    .sort((a, b) => {
      const ta = a.flight?.eta ?? a.flight?.sta ?? ''
      const tb = b.flight?.eta ?? b.flight?.sta ?? ''
      return ta.localeCompare(tb)
    })

  const chartData = buildDepartureChart(stands)

  return (
    <div
      className="flex flex-col h-full shrink-0"
      style={{ width: 240, background: '#111827', borderLeft: '1px solid #1E2D45' }}
    >

      {/* Alerts section */}
      {(showAlerts || alerts.length > 0) && (
        <div
          className="border-b"
          style={{ borderColor: '#1E2D45' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ borderBottom: '1px solid #1E2D45' }}
          >
            <AlertTriangle size={12} style={{ color: '#EF4444' }} />
            <span className="font-sans font-semibold" style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Active Alerts
            </span>
            <div
              className="ml-auto w-4 h-4 flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.2)', borderRadius: 2 }}
            >
              <span className="mono font-bold" style={{ fontSize: 9, color: '#FCA5A5' }}>{alerts.length}</span>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="px-3 py-2 border-b"
                style={{
                  borderColor: '#1E2D45',
                  background: SEVERITY_BG[alert.severity],
                  borderLeft: `2px solid ${SEVERITY_COLOR[alert.severity]}`,
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="mono font-bold"
                    style={{ fontSize: 10, color: SEVERITY_COLOR[alert.severity] }}
                  >
                    {alert.standId}
                  </span>
                  <span
                    className="font-sans"
                    style={{ fontSize: 9, color: '#4B5563' }}
                  >
                    {Math.round((Date.now() - alert.ts) / 60000)}m ago
                  </span>
                </div>
                <p className="font-sans leading-tight" style={{ fontSize: 10, color: '#94A3B8' }}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arrivals feed */}
      <div className="border-b flex-shrink-0" style={{ borderColor: '#1E2D45' }}>
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: '1px solid #1E2D45' }}
        >
          <Clock size={12} style={{ color: '#3B82F6' }} />
          <span className="font-sans font-semibold" style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Arrivals — next 90 min
          </span>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
          {arrivals.length === 0 ? (
            <div className="px-3 py-3" style={{ fontSize: 11, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
              No arrivals in window
            </div>
          ) : (
            arrivals.map(s => {
              const t = s.flight?.eta ?? s.flight?.sta ?? ''
              const mins = minsUntil(t)
              const late = s.flight?.eta && s.flight.eta !== s.flight.sta

              return (
                <div
                  key={s.id}
                  className="flex items-center px-3 py-1.5 border-b"
                  style={{ borderColor: '#1E2D45' }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <span className="mono font-semibold" style={{ fontSize: 11, color: '#93C5FD' }}>
                        {s.flight!.callsign}
                      </span>
                      <span className="mono" style={{ fontSize: 10, color: '#4B5563' }}>
                        {s.flight!.aircraftType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
                        {s.flight!.origin} → {s.id}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mono font-semibold" style={{ fontSize: 11, color: late ? '#F59E0B' : '#E2E8F0' }}>
                      {t}Z
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: mins < 15 ? '#F59E0B' : '#4B5563' }}>
                      {Math.round(mins)}m
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Departures chart */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: '1px solid #1E2D45' }}
        >
          <TrendingUp size={12} style={{ color: '#22C55E' }} />
          <span className="font-sans font-semibold" style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Departures / hour
          </span>
        </div>
        <div className="flex-1 px-2 py-2 min-h-0">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} barSize={16} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 8, fill: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: '#1E2D45' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={{ stroke: '#1E2D45' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.count >= 4 ? '#EF4444' : entry.count >= 2 ? '#F59E0B' : '#3B82F6'}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stand summary stats */}
        <div
          className="grid grid-cols-2 gap-px border-t"
          style={{ borderColor: '#1E2D45', background: '#1E2D45' }}
        >
          {[
            { label: 'Total Stands', value: stands.length, color: '#94A3B8' },
            { label: 'Occupied', value: stands.filter(s => ['occupied','arriving','departing','delayed'].includes(s.status)).length, color: '#22C55E' },
            { label: 'Vacant', value: stands.filter(s => s.status === 'vacant').length, color: '#334155' },
            { label: 'Maintenance', value: stands.filter(s => s.status === 'maintenance').length, color: '#94A3B8' },
          ].map(item => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center py-2"
              style={{ background: '#111827' }}
            >
              <span className="mono font-bold" style={{ fontSize: 18, color: item.color }}>
                {item.value}
              </span>
              <span className="font-sans" style={{ fontSize: 9, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
