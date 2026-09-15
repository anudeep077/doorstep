import { NextResponse, type NextRequest } from "next/server";
import type { GeocodeResult } from "@/lib/types";

// Thin proxy over OpenStreetMap Nominatim. Exists so we can send the
// identifying User-Agent their usage policy asks for (browsers won't let
// page JS set one) and so the provider can be swapped without touching the
// client. Two modes:
//   GET /api/geocode?lat=..&lon=..   reverse: coordinates -> address
//   GET /api/geocode?q=..            forward: free text -> up to 5 candidates

const NOMINATIM = "https://nominatim.openstreetmap.org";
const HEADERS = {
  "User-Agent": "food-delivery-portfolio-app/0.1 (learning project)",
  Accept: "application/json",
};

type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string | undefined>;
};

// "Deliver to: <city/area>" wants the neighbourhood, not a 12-part address.
function shortLabel(p: NominatimPlace) {
  const a = p.address ?? {};
  const area = a.neighbourhood ?? a.suburb ?? a.quarter ?? a.city_district ?? a.village ?? a.town;
  const city = a.city ?? a.town ?? a.county ?? a.state;
  if (area && city && area !== city) return `${area}, ${city}`;
  return area ?? city ?? p.display_name.split(",").slice(0, 2).join(",");
}

function toResult(p: NominatimPlace): GeocodeResult {
  return {
    id: String(p.place_id),
    short_label: shortLabel(p),
    formatted: p.display_name,
    lat: Number(p.lat),
    lng: Number(p.lon),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const q = searchParams.get("q")?.trim();

  let url: string;
  if (lat && lon) {
    url = `${NOMINATIM}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  } else if (q) {
    url = `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`;
  } else {
    return NextResponse.json({ error: "Pass lat & lon, or q" }, { status: 400 });
  }

  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ error: `Geocoder returned ${res.status}` }, { status: 502 });
    const body = (await res.json()) as NominatimPlace | NominatimPlace[] | { error: string };

    if (Array.isArray(body)) return NextResponse.json({ results: body.map(toResult) });
    if ("error" in body) return NextResponse.json({ error: body.error }, { status: 404 });
    return NextResponse.json({ results: [toResult(body)] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Geocoder unreachable" }, { status: 502 });
  }
}
