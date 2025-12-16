"use client";
import { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import React from 'react';

interface MapViewProps {
  selectedTruckId?: string;
  trucksList: { id: number; localizacao: string; ativo: boolean }[]; // Lista para plotar markers
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "30px",
};

const center = { lat: -23.55052, lng: -46.633308 }; // São Paulo default

const getCoordsFromLocalizacao = (localizacao: string): { lat: number; lng: number } => {
  if (localizacao.includes("Cidade X")) return { lat: -23.55052, lng: -46.633308 };
  return center;
};

export default function MapView({ selectedTruckId, trucksList }: MapViewProps) {
  const [showMap, setShowMap] = useState(false);
  if (!trucksList || !Array.isArray(trucksList)) {
    return (
      <div
        style={{
          height: "510px",
          width: "400px",
          borderRadius: "30px",
          backgroundColor: "#d1d5db",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Carregando trucks...</p> {/*  */}
      </div>
    );
  }

  const filteredTrucks = selectedTruckId 
    ? trucksList.filter((truck) => truck.id.toString() === selectedTruckId)
    : trucksList;

  const mapCenter = filteredTrucks.length > 0 
    ? getCoordsFromLocalizacao(filteredTrucks[0].localizacao)
    : center;

  return (
    <div
      style={{
        height: "510px",
        width: "400px",
        borderRadius: "30px",
        backgroundColor: "#d1d5db",
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
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={13}
            options={{
              styles: [],
            }}
          >
            {filteredTrucks.map((truck) => {
              const position = getCoordsFromLocalizacao(truck.localizacao);
              return (
                <Marker
                  key={truck.id}
                  position={position}
                  title={`Truck ${truck.id} - ${truck.localizacao}`}
                  icon={truck.ativo ? undefined : { url: "/inactive-marker.png" }}
                />
              );
            })}
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
}