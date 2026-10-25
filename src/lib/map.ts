import type { LatLng } from '../types'

export const MAP_BOUNDS = {
  north: 14.528,
  south: 14.398,
  west: 79.892,
  east: 80.062,
} as const

export const SVG_VIEW = { width: 1000, height: 640 } as const

export const LEAFLET_BOUNDS: [[number, number], [number, number]] = [
  [14.407, 79.93],
  [14.515, 80.05],
]

export const MAP_CENTER: [number, number] = [14.461, 79.995]

export interface ProjectedPoint {
  x: number
  y: number
}

export function projectToMap(point: LatLng): ProjectedPoint {
  const x = ((point.lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * SVG_VIEW.width
  const y = ((MAP_BOUNDS.north - point.lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * SVG_VIEW.height
  return { x, y }
}

export function mapPolyline(points: LatLng[], closed = false): string {
  if (points.length === 0) return ''
  const projected = points.map(projectToMap)
  const commands = projected.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
  return `${commands.join(' ')}${closed ? ' Z' : ''}`
}

export function mapSmoothPath(points: LatLng[], closed = false): string {
  if (points.length < 3) return mapPolyline(points, closed)
  const p = points.map(projectToMap)
  const segments: string[] = [`M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`]
  const count = closed ? p.length : p.length - 1

  for (let index = 0; index < count; index += 1) {
    const p0 = p[(index - 1 + p.length) % p.length] ?? p[index]
    const p1 = p[index]
    const p2 = p[(index + 1) % p.length]
    const p3 = p[(index + 2) % p.length] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    segments.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    )
  }

  if (closed) segments.push('Z')
  return segments.join(' ')
}

export function projectPointAtFraction(points: LatLng[], fraction: number): ProjectedPoint | null {
  if (points.length === 0) return null
  if (points.length === 1) return projectToMap(points[0])

  const projected = points.map(projectToMap)
  const lengths: number[] = []
  let total = 0
  for (let index = 0; index < projected.length - 1; index += 1) {
    const dx = projected[index + 1].x - projected[index].x
    const dy = projected[index + 1].y - projected[index].y
    const length = Math.hypot(dx, dy)
    lengths.push(length)
    total += length
  }

  let target = Math.max(0, Math.min(1, fraction)) * total
  for (let index = 0; index < lengths.length; index += 1) {
    if (target <= lengths[index] || index === lengths.length - 1) {
      const ratio = lengths[index] > 0 ? target / lengths[index] : 0
      const start = projected[index]
      const end = projected[index + 1]
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      }
    }
    target -= lengths[index]
  }

  return projected[projected.length - 1]
}

export function roadLabelPosition(geometry: LatLng[], fraction = 0.58, offset = 13): ProjectedPoint | null {
  if (geometry.length < 2) return null
  const projected = geometry.map(projectToMap)
  const anchor = projectPointAtFraction(geometry, fraction)
  if (!anchor) return null

  const total = projected.reduce((sum, point, index) => {
    if (index === 0) return 0
    return sum + Math.hypot(point.x - projected[index - 1].x, point.y - projected[index - 1].y)
  }, 0)
  let target = total * fraction
  for (let index = 0; index < projected.length - 1; index += 1) {
    const start = projected[index]
    const end = projected[index + 1]
    const length = Math.hypot(end.x - start.x, end.y - start.y)
    if (target <= length || index === projected.length - 2) {
      const dx = end.x - start.x
      const dy = end.y - start.y
      const norm = Math.max(1, Math.hypot(dx, dy))
      return {
        x: anchor.x + (-dy / norm) * offset,
        y: anchor.y + (dx / norm) * offset,
      }
    }
    target -= length
  }
  return { x: anchor.x, y: anchor.y + offset }
}

export function midpointOf(points: LatLng[], fraction = 0.5): LatLng {
  if (points.length === 0) return { lat: MAP_CENTER[0], lng: MAP_CENTER[1] }
  if (points.length === 1) return points[0]
  const index = Math.max(0, Math.min(points.length - 1, Math.round((points.length - 1) * fraction)))
  return points[index]
}

/** A decorative coastline for the fictional district, in the same coordinate system as the data. */
export const COASTLINE: LatLng[] = [
  { lat: 14.53, lng: 80.034 },
  { lat: 14.516, lng: 80.041 },
  { lat: 14.505, lng: 80.044 },
  { lat: 14.493, lng: 80.048 },
  { lat: 14.48, lng: 80.051 },
  { lat: 14.468, lng: 80.052 },
  { lat: 14.456, lng: 80.047 },
  { lat: 14.446, lng: 80.05 },
  { lat: 14.434, lng: 80.056 },
  { lat: 14.421, lng: 80.055 },
  { lat: 14.409, lng: 80.051 },
  { lat: 14.394, lng: 80.06 },
]

export const RIVER_PATH: LatLng[] = [
  { lat: 14.525, lng: 79.912 },
  { lat: 14.512, lng: 79.938 },
  { lat: 14.503, lng: 79.957 },
  { lat: 14.494, lng: 79.972 },
  { lat: 14.487, lng: 79.982 },
  { lat: 14.478, lng: 79.993 },
  { lat: 14.464, lng: 80.006 },
  { lat: 14.448, lng: 80.019 },
  { lat: 14.43, lng: 80.03 },
  { lat: 14.415, lng: 80.04 },
  { lat: 14.401, lng: 80.049 },
]
