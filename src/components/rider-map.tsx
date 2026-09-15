"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import type { LatLng } from "@/lib/orders";

// Inline SVG div-icons instead of Leaflet's PNG markers, which need image
// asset wiring under a bundler and can't be themed anyway.
const svg = {
  restaurant:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16M5 11l1 9h12l1-9M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z"/></svg>',
  rider:
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zM5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>',
};

const icon = (kind: keyof typeof svg) =>
  L.divIcon({
    html: `<div class="map-marker map-marker--${kind}">${svg[kind]}</div>`,
    className: "", // drop Leaflet's default white box
    iconSize: kind === "rider" ? [44, 44] : [36, 36],
    iconAnchor: kind === "rider" ? [22, 22] : [18, 18],
  });

function FitOnce({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit once on mount
  }, [map]);
  return null;
}

export default function RiderMap({
  restaurant,
  home,
  rider,
  route,
}: {
  restaurant: LatLng;
  home: LatLng;
  rider: LatLng;
  route: LatLng[];
}) {
  const icons = useMemo(() => ({ restaurant: icon("restaurant"), home: icon("home"), rider: icon("rider") }), []);
  return (
    <MapContainer
      center={[rider.lat, rider.lng]}
      zoom={14}
      zoomControl={false}
      attributionControl
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={route.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.8, dashArray: "1 8", lineCap: "round" }} />
      <Marker position={[restaurant.lat, restaurant.lng]} icon={icons.restaurant} title="Restaurant" />
      <Marker position={[home.lat, home.lng]} icon={icons.home} title="Your address" />
      <Marker position={[rider.lat, rider.lng]} icon={icons.rider} title="Rider" zIndexOffset={1000} />
      <FitOnce points={[restaurant, home]} />
    </MapContainer>
  );
}
