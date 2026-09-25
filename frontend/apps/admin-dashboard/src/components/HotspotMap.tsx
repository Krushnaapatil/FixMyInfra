import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@fixmyinfra/ui-kit';
import type { Complaint } from '@fixmyinfra/types';
import { DEPARTMENTS, categoryColorFor, departmentNameFor } from '@fixmyinfra/types';
import { relativeTime } from '../utils/time';

// Nashik city centre, used as the default map focus.
const NASHIK_CENTER = { latitude: 19.9975, longitude: 73.7898 };

// Colours and legend come from the shared catalogue, which is what keeps this
// map identical to the citizen portal's without a second hand-maintained copy.
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

export function HotspotMap({ complaints }: { complaints: Complaint[] }) {
  return (
    <Card>
      <h2 className="text-base font-bold text-slate-900">Grievance Hotspots</h2>
      <p className="mt-1 text-xs text-slate-500">
        {complaints.length === 0
          ? 'Live Nashik map — pins appear as citizens report'
          : `${complaints.length} citizen reports plotted live on Nashik`}
      </p>
      <div className="relative z-0 mt-4 overflow-hidden rounded-xl border border-slate-200" aria-label="Live map of citizen grievance reports in Nashik">
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
                <br />
                {departmentNameFor(complaint.departmentId)}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        {complaints.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-white/85 px-4 py-2 text-center text-[11px] font-medium text-slate-500">
            Nashik · No reports yet — pins from citizen reports will show up here.
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {legend.map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}
