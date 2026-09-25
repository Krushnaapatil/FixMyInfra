import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NASHIK_CENTER } from './homeAssets';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

const pinIcon = L.divIcon({
  className: 'fixmyinfra-picker-pin',
  html: '<svg width="30" height="30" viewBox="0 0 28 28"><path d="M14 1C8 1 3.5 5.5 3.5 11c0 7 10.5 16 10.5 16S24.5 18 24.5 11C24.5 5.5 20 1 14 1z" fill="#0D7A6E"/><circle cx="14" cy="11" r="4" fill="#ffffff"/></svg>',
  iconSize: [30, 30],
  iconAnchor: [15, 28]
});

function ClickSetter({ onChange }: { onChange: MapPickerProps['onChange'] }) {
  useMapEvents({
    click(event) {
      onChange(round6(event.latlng.lat), round6(event.latlng.lng));
    }
  });
  return null;
}

function Recenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [map, latitude, longitude]);
  return null;
}

export function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const centerLat = Number.isFinite(latitude) ? latitude : NASHIK_CENTER.latitude;
  const centerLng = Number.isFinite(longitude) ? longitude : NASHIK_CENTER.longitude;

  return (
    <div className="relative z-0 overflow-hidden rounded-xl border border-[#dce9e6]">
      <MapContainer center={[centerLat, centerLng]} zoom={13} scrollWheelZoom={false} className="h-64 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickSetter onChange={onChange} />
        <Recenter latitude={centerLat} longitude={centerLng} />
        <Marker
          position={[centerLat, centerLng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;
              const point = marker.getLatLng();
              onChange(round6(point.lat), round6(point.lng));
            }
          }}
        />
      </MapContainer>
    </div>
  );
}
