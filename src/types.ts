export type StandStatus =
  | 'occupied'
  | 'arriving'
  | 'departing'
  | 'scheduled'
  | 'vacant'
  | 'maintenance'
  | 'delayed'

export type StandZone = 'East' | 'West' | 'Remote'
export type SizeCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface Flight {
  callsign: string
  airline: string        // IATA code e.g. "TG"
  airlineName: string    // Full name
  aircraftType: string   // ICAO type e.g. "B789"
  aircraftReg: string    // e.g. "HS-TKA"
  origin: string         // IATA airport
  destination: string
  sta: string            // Scheduled Time of Arrival HH:MM (UTC)
  eta?: string           // Estimated (if different)
  std: string            // Scheduled Time of Departure HH:MM (UTC)
  etd?: string
  pax: number
  turnaroundMins: number
}

export interface StandService {
  jetbridge: boolean
  fuel: boolean
  gpu: boolean
  water: boolean
  pushback: boolean
}

export interface Stand {
  id: string
  zone: StandZone
  status: StandStatus
  sizeLimit: SizeCategory
  services: StandService
  flight?: Flight
  occupiedSinceMs?: number  // epoch ms
  occupiedUntilMs?: number  // epoch ms
  maintenanceNote?: string
  conflict?: boolean
}

export type SortKey = 'id' | 'status' | 'callsign' | 'aircraft' | 'sta' | 'std' | 'countdown'
export type SortDir = 'asc' | 'desc'

export interface FilterState {
  zone: StandZone | 'All'
  status: StandStatus | 'All'
  search: string
}

export interface Alert {
  id: string
  type: 'conflict' | 'delay' | 'maintenance' | 'overstay'
  standId: string
  message: string
  ts: number  // epoch ms
  severity: 'critical' | 'warn' | 'info'
}
