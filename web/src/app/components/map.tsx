"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";  // 👈 useEffect para geocoding

// Fix para ícones default do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapTilerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  trucksList?: Array<{
    id: number;
    localizacao: string;
    ativo: boolean | number;
  }>;
  selectedTruckId?: string;
}

const apiKey = "s4p7ytulctrEz0RMIq2S";  // Hardcoded para teste

// 👈 Cache para coords (evita chamadas repetidas)
const coordsCache = new Map<string, { lat: number; lng: number }>();

const geocodeLocalizacao = async (localizacao: string): Promise<{ lat: number; lng: number }> => {
  if (coordsCache.has(localizacao)) {
    return coordsCache.get(localizacao)!;
  }

  try {
    const response = await fetch(`https://api.maptiler.com/geocoding/search.json?key=${apiKey}&text=${encodeURIComponent(localizacao)}`);
    if (!response.ok) throw new Error("Geocoding failed");
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;  // MapTiler retorna [lng, lat]
      const coords = { lat, lng };
      coordsCache.set(localizacao, coords);
      console.log(`Geocoded "${localizacao}":`, coords);  // 👈 Log para debug
      return coords;
    }
  } catch (error) {
    console.error("Erro no geocoding:", error);
  }

  // Fallback default SP
  const fallback = { lat: -23.55052, lng: -46.633308 };
  coordsCache.set(localizacao, fallback);
  return fallback;
};

export default function MapView({ 
  center = { lat: -23.55052, lng: -46.633308 }, 
  zoom = 10, 
  trucksList = [], 
  selectedTruckId 
}: MapTilerProps) {
  const [showMap, setShowMap] = useState(false);
  const [markers, setMarkers] = useState<Array<{ position: { lat: number; lng: number }; popup: string; icon?: string; }>>([]);  // 👈 State para markers carregados
  const [loadingMarkers, setLoadingMarkers] = useState(false);

  // 👈 Effect para geocoding ao montar ou mudar trucks
  useEffect(() => {
    if (trucksList.length === 0) return;

    setLoadingMarkers(true);
    const loadMarkers = async () => {
      const filteredTrucks = selectedTruckId 
        ? trucksList.filter((truck) => truck.id.toString() === selectedTruckId)
        : trucksList;

      const newMarkers = [];
      for (const truck of filteredTrucks) {
        const position = await geocodeLocalizacao(truck.localizacao);
        const isActive = truck.ativo === 1 || truck.ativo === true;
        newMarkers.push({
          position,
          popup: `Truck ${truck.id} - ${truck.localizacao} (${isActive ? 'Ativo' : 'Inativo'})`,
          icon: isActive ? undefined : "/inactive-marker.png",
        });
      }

      setMarkers(newMarkers);
      setLoadingMarkers(false);
      console.log("Markers carregados:", newMarkers.length);  // 👈 Log para quantos markers
    };

    loadMarkers();
  }, [trucksList, selectedTruckId]);

  if (!apiKey) {
    return (
      <div className="h-128 w-96 border rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">API Key do MapTiler não configurada. Adicione NEXT_PUBLIC_MAPTILER_API_KEY no .env.</p>
      </div>
    );
  }

  return (
    <div className="h-128 w-96 border rounded-lg bg-gray-100 relative">
      {!showMap ? (
        <button
          onClick={() => setShowMap(true)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Visualizar Mapa
        </button>
      ) : loadingMarkers ? (
        <div className="flex items-center justify-center h-full">
          <p>Carregando markers...</p>
        </div>
      ) : (
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer
            url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${apiKey}`}
            attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.position.lat, marker.position.lng]}
              icon={marker.icon ? L.icon({ iconUrl: marker.icon, iconSize: [25, 41], iconAnchor: [12, 41] }) : undefined}
            >
              <Popup>{marker.popup}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}