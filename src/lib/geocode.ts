import "server-only";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  importance?: number;
}

/**
 * Best-effort free geocoding via OpenStreetMap's Nominatim service. No API key required, ever.
 * Requests a handful of candidates and picks the highest-"importance" match rather than the first
 * result, since Nominatim's first hit for a short query is often the wrong place. Returns null on any
 * failure so place creation never blocks on this - the pin can always be corrected by hand afterward.
 */
export async function geocodePlace(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "OurLittleWorldApp/1.0 (personal relationship journal)" },
    });
    if (!response.ok) return null;
    const results = (await response.json()) as NominatimResult[];
    if (!results || results.length === 0) return null;

    const best = [...results].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))[0];
    const lat = parseFloat(best.lat);
    const lng = parseFloat(best.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng, label: best.display_name };
  } catch {
    return null;
  }
}
