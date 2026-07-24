import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { trpc } from '@/lib/trpc';

// Corrigir o ícone padrão do Leaflet no React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function GPSMap({ orderId }: { orderId: number }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const { data } = trpc.orders.getLocation.useQuery(
    { orderId },
    { refetchInterval: 5000 } // Atualizar mapa a cada 5 segundos
  );

  useEffect(() => {
    if (data?.lat && data?.lng) {
      setPosition([data.lat, data.lng]);
    }
  }, [data]);

  if (!position) {
    return (
      <div className="h-[250px] w-full rounded-lg bg-[#111111] border border-[#C9A227]/20 flex items-center justify-center mt-6">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 mx-auto mb-2 border-t-2 border-[#C9A227] rounded-full"></div>
          <p className="text-sm text-[#8A7A5A]">Buscando localização do motoboy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-[#C9A227]/30 mt-6 relative z-0">
      <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={position} />
        <Marker position={position}>
          <Popup>Motoboy está aqui!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
