// Mock simples: Retorna componentes vazios que não quebram
export const MapContainer = ({ children, ...props }) => <div {...props}>{children}</div>;
export const TileLayer = () => null;
export const Marker = ({ children, ...props }) => <div {...props}>{children}</div>;
export const Popup = ({ children }) => <div>{children}</div>;

// Hooks mockados (se usados no componente)
export const useMap = () => ({});
export const useMapEvent = () => {};
export const useMapEvents = () => {};