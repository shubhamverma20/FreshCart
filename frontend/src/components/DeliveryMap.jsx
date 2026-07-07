import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Icons using the existing ion-icons in the project
const createIcon = (color, iconName) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 2px solid white; color: white; font-size: 18px;"><ion-icon name="${iconName}"></ion-icon></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const storeIcon = createIcon('#EF4444', 'storefront'); // Red
const homeIcon = createIcon('#3B82F6', 'home'); // Blue
const driverIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #10B981; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4); border: 2px solid white; color: white; font-size: 24px;"><ion-icon name="bicycle"></ion-icon></div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
}); // Larger Green Scooter

export default function DeliveryMap({ driverLocation }) {
  const storeLocation = [19.0760, 72.8777];
  const homeLocation = [19.0810, 72.8830];
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    // Simulated route line from store to home
    setRouteCoordinates([
      [19.0760, 72.8777],
      [19.0765, 72.8785],
      [19.0772, 72.8790],
      [19.0780, 72.8800],
      [19.0790, 72.8810],
      [19.0800, 72.8820],
      [19.0810, 72.8830]
    ]);
  }, []);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer 
        center={[19.0785, 72.8800]} 
        zoom={16} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker position={storeLocation} icon={storeIcon} />
        <Marker position={homeLocation} icon={homeIcon} />
        
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
        )}

        {routeCoordinates.length > 0 && (
          <Polyline 
            positions={routeCoordinates} 
            pathOptions={{ color: '#10B981', weight: 4, dashArray: '10, 10' }} 
          />
        )}
      </MapContainer>
    </div>
  );
}
