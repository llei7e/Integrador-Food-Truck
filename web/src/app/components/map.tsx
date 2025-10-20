"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function MapView() {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
  }, []);

  return (
    <div
      style={{
        height: "510px",
        width: "400px",
        borderRadius: "30px",
        backgroundColor: "#d1d5db", // cinza (Tailwind gray-300)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!showMap ? (
        <button
          onClick={() => setShowMap(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            backgroundColor: "#3b82f6",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: "pointer",
            border: "none",
          }}
        >
          Visualizar mapa
        </button>
      ) : (
        <MapContainer
          key="map"
          center={[-23.55052, -46.633308] as [number, number]}
          zoom={13}
          style={{ height: "100%", width: "100%", borderRadius: "30px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[-23.55052, -46.633308]}>
            <Popup>São Paulo</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
}
