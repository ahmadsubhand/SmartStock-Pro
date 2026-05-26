import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Fix ikon default Leaflet yang sering hilang di React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: any }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function WarehouseMap({ lat, lng, onLocationSelect }: MapProps) {
  const center: [number, number] = lat && lng ? [lat, lng] : [-6.2088, 106.8456]; // Default Jakarta

  return (
    <MapContainer center={center} zoom={13} className="h-75 w-full rounded-md border">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {lat && lng && <Marker position={[lat, lng]} />}
      <MapClickHandler onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}