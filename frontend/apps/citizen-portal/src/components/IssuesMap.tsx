import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Surface } from './Surface';
import { NASHIK_CENTER } from './homeAssets';
import type { Complaint } from '@fixmyinfra/types';
import { DEPARTMENTS, categoryColorFor } from '@fixmyinfra/types';
import { relativeTime } from '../utils/time';

// Legend is derived from the catalogue so every selectable category has a
// colour and appears here. It previously listed only four of the seven, which
// left "Fallen tree", "Mosquito breeding" and "Illegal hoarding" rendering as
// an unlabelled fallback dot.
const legend = DEPARTMENTS.map((department) => [department.color, department.name] as [string, string]);

function FitComplaints({ complaints }: { complaints: Complaint[] }) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length === 0) return;
    const points = complaints.map(
      (complaint) => [complaint.latitude, complaint.longitude] as [number, number]
    );
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points).pad(0.3));
    }
  }, [map, complaints]);
  return null;
}

export function IssuesMap({ complaints = [] }: { complaints?: Complaint[] }) {
  return (
    <Surface className="!rounded-2xl !border-[#e7efec] !p-5 !shadow-sm">
      <h2 className="text-[15px] font-bold text-[#17393b]">Issues around you</h2>
      <div className="relative z-0 mt-3 overflow-hidden rounded-xl border border-[#dceae7]" aria-label="Map showing your reported issues">
        <MapContainer
          center={[NASHIK_CENTER.latitude, NASHIK_CENTER.longitude]}
          zoom={12}
          scrollWheelZoom={false}
          className="h-56 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitComplaints complaints={complaints} />
          {complaints.map((complaint) => (
            <CircleMarker
              key={complaint.id}
              center={[complaint.latitude, complaint.longitude]}
              radius={8}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: categoryColorFor(complaint.category),
                fillOpacity: 0.95
              }}
            >
              <Popup>
                <strong>{complaint.category}</strong>
                <br />
                {complaint.status.replace('_', ' ')} · {relativeTime(complaint.createdAt)}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        {complaints.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-white/85 px-4 py-2 text-center text-[11px] font-medium text-[#52716f]">
            Nashik · No reports yet — pins from your reports will show up here.
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {legend.map(([color, label]) => <span key={label} className="flex items-center gap-1.5 text-[11px] font-medium text-[#5b7371]"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}
      </div>
    </Surface>
  );
}
