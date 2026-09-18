export interface GeoPoint {
  lat: number
  lng: number
}

export const MOSQUE_CHECK_IN_RADIUS_METERS = 150
export const DEFAULT_MOSQUE_MIN_STAY_MINUTES = 10

export function mosqueMinStayMs(minutes: number): number {
  return minutes * 60 * 1000
}

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export function geolocationErrorMessage(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return "Location access is blocked — enable it in your browser settings to check in."
  }
  return "Couldn't get your location. Move to an open area and try again."
}
