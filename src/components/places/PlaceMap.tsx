"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/types";

// Leaflet's default marker icons reference local asset paths that don't survive bundling —
// point them at the CDN copies instead so pins actually render.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FlyToSelected({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], 12, { duration: 0.6 });
    }
  }, [lat, lng, map]);
  return null;
}

/** While pin-editing is active, clicking anywhere on the map moves the pin there too (in addition to dragging it). */
function ClickToMove({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onMove(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function PlaceMap({
  places,
  selectedId,
  onSelect,
  editingId,
  onPinMoved,
}: {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** If set, that place's marker becomes draggable (and the map becomes click-to-move) so its pin can be corrected. */
  editingId?: string | null;
  onPinMoved?: (lat: number, lng: number) => void;
}) {
  const withCoords = places.filter((p) => p.lat !== null && p.lng !== null);
  const selected = withCoords.find((p) => p.id === selectedId) ?? null;
  const center: [number, number] = withCoords.length > 0 ? [withCoords[0].lat as number, withCoords[0].lng as number] : [20, 0];

  return (
    <MapContainer center={center} zoom={withCoords.length > 0 ? 3 : 2} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((place) => {
        const isEditing = editingId === place.id;
        return (
          <Marker
            key={place.id}
            position={[place.lat as number, place.lng as number]}
            icon={markerIcon}
            draggable={isEditing}
            eventHandlers={{
              click: () => onSelect(place.id),
              dragend: (e) => {
                const marker = e.target as L.Marker;
                const pos = marker.getLatLng();
                onPinMoved?.(pos.lat, pos.lng);
              },
            }}
          >
            <Popup>{isEditing ? "Drag me to the right spot, or click the map" : place.name}</Popup>
          </Marker>
        );
      })}
      {selected && <FlyToSelected lat={selected.lat} lng={selected.lng} />}
      {editingId && onPinMoved && <ClickToMove onMove={onPinMoved} />}
    </MapContainer>
  );
}
