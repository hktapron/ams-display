import React from 'react'
import { AlertTriangle, Wind, Eye, Cloud, Gauge } from 'lucide-react'
import { METAR } from '../data/mock'
import type { Alert } from '../types'

interface TopBarProps {
  alerts: Alert[]
  onAlertsClick: () => void
}

function useClock() {
  const [time, setTime] = React.useState(new Date())
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function pad2(n: number) { return String(n).padStart(2, '0') }

export function TopBar({ alerts, onAlertsClick }: TopBarProps) {
  const now = useClock()
  const utcH = pad2(now.getUTCHours())
  const utcM = pad2(now.getUTCMinutes())
  const utcS = pad2(now.getUTCSeconds())
  const localH = pad2((now.getUTCHours() + 7) % 24)
  const localM = pad2(now.getUTCMinutes())
  const localS = pad2(now.getUTCSeconds())
  const dateStr = now.toISOString().substring(0, 10)

  const criticalCount = alerts.filter(a => a.severity === 'critical').length

  return (
    <div
      className="flex items-center justify-between h-11 px-4 border-b shrink-0"
      style={{ background: '#111827', borderColor: '#1E2D45' }}
    >
      {/* Left — Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ background: '#3B82F6', borderRadius: 2 }}
          >
            <span className="mono text-white font-bold" style={{ fontSize: 9 }}>HKT</span>
          </div>
          <span className="font-sans font-bold text-text-primary tracking-tight" style={{ fontSize: 13 }}>
            AMS Display
          </span>
          <span className="font-sans text-text-dim" style={{ fontSize: 11 }}>
            Phuket International — Apron Operations
          </span>
        </div>

        {/* METAR strip */}
        <div
          className="hidden lg:flex items-center gap-3 px-3 h-7"
          style={{ background: '#0B0F1A', borderRadius: 2, border: '1px solid #1E2D45' }}
        >
          <span className="mono text-2xs" style={{ color: '#94A3B8' }}>METAR</span>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3 h-3" style={{ color: '#4B5563' }} />
            <span className="mono text-2xs text-text-secondary">{METAR.wind}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3 h-3" style={{ color: '#4B5563' }} />
            <span className="mono text-2xs text-text-secondary">{METAR.vis}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3 h-3" style={{ color: '#4B5563' }} />
            <span className="mono text-2xs text-text-secondary">{METAR.clouds}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3 h-3" style={{ color: '#4B5563' }} />
            <span className="mono text-2xs text-text-secondary">{METAR.qnh}</span>
          </div>
          <div
            className="px-1.5 py-0.5"
            style={{
              background: '#0F3460',
              borderRadius: 2,
              border: '1px solid #1D4ED8',
            }}
          >
            <span className="mono text-2xs font-semibold" style={{ color: '#93C5FD' }}>
              {METAR.trend}
            </span>
          </div>
        </div>
      </div>

      {/* Right — Clocks + Alerts + User */}
      <div className="flex items-center gap-3">
        {/* Alert button */}
        <button
          onClick={onAlertsClick}
          className="flex items-center gap-1.5 px-2.5 h-7 transition-opacity hover:opacity-80"
          style={{
            background: criticalCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.10)',
            borderRadius: 2,
            border: `1px solid ${criticalCount > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.25)'}`,
          }}
        >
          <AlertTriangle
            className={criticalCount > 0 ? 'blink' : ''}
            style={{
              width: 12,
              height: 12,
              color: criticalCount > 0 ? '#EF4444' : '#F59E0B',
            }}
          />
          <span
            className="mono font-semibold"
            style={{
              fontSize: 11,
              color: criticalCount > 0 ? '#FCA5A5' : '#FCD34D',
            }}
          >
            {alerts.length} ALERT{alerts.length !== 1 ? 'S' : ''}
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: '#1E2D45' }} />

        {/* UTC Clock */}
        <div className="flex flex-col items-end">
          <div className="mono font-semibold leading-none" style={{ fontSize: 13, color: '#E2E8F0' }}>
            {utcH}:{utcM}:{utcS}
            <span className="ml-1 font-normal" style={{ fontSize: 10, color: '#4B5563' }}>UTC</span>
          </div>
          <div className="mono leading-none mt-0.5" style={{ fontSize: 10, color: '#94A3B8' }}>
            {dateStr}
          </div>
        </div>

        {/* Local Clock */}
        <div className="flex flex-col items-end">
          <div className="mono font-semibold leading-none" style={{ fontSize: 13, color: '#94A3B8' }}>
            {localH}:{localM}:{localS}
            <span className="ml-1 font-normal" style={{ fontSize: 10, color: '#4B5563' }}>L</span>
          </div>
          <div className="mono leading-none mt-0.5" style={{ fontSize: 10, color: '#4B5563' }}>
            UTC+7
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: '#1E2D45' }} />

        {/* User badge */}
        <div
          className="flex items-center gap-2 px-2.5 h-7"
          style={{
            background: '#0B0F1A',
            borderRadius: 2,
            border: '1px solid #1E2D45',
          }}
        >
          <div
            className="w-4 h-4 flex items-center justify-center"
            style={{ background: '#3B82F6', borderRadius: 2 }}
          >
            <span className="mono font-bold text-white" style={{ fontSize: 9 }}>SS</span>
          </div>
          <span className="font-sans font-semibold" style={{ fontSize: 11, color: '#94A3B8' }}>
            Supervisor
          </span>
        </div>
      </div>
    </div>
  )
}
