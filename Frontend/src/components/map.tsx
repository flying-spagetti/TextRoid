import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon to resolve default icon issues
const customIcon = new Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Recenter map component when coordinates change
const RecentMapView = ({ coords }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([coords.lat, coords.lng], 10);
  }, [coords, map]);
  return null;
};

const LocationMapCard = ({ coords = { lat: 51.505, lng: -0.09 } }) => {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Location Map</CardTitle>
        <CardDescription>Visual representation of the selected location.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden rounded-b-lg">
        <div className="h-80 w-full">
          <MapContainer 
            center={[coords.lat, coords.lng]} 
            zoom={10} 
            scrollWheelZoom={false}
            className="h-full w-full z-0"
            style={{ height: '320px', width: '100%' }}
          >
            <RecentMapView coords={coords} />
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker 
              position={[coords.lat, coords.lng]} 
              icon={customIcon}
            />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMapCard;