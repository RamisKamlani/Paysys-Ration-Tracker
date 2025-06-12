import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapViewer() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/locations')
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error('Error fetching locations:', err));
  }, []);

  if (locations.length === 0) {
    return <p>Loading map...</p>;
  }

  const center = [locations[0].lat, locations[0].lng]; // center map on first location

  const deleteLocation = async (index) => {
  const confirm = window.confirm('Are you sure you want to delete this location from the server?');
  if (!confirm) return;

  try {
    const res = await fetch(`http://localhost:5000/api/locations/${index}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete');

    const updated = await fetch('http://localhost:5000/api/locations');
    const data = await updated.json();
    setLocations(data);
    alert('Location deleted.');
  } catch (err) {
    console.error('Delete failed:', err);
    alert('Failed to delete location.');
  }
};


  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom={true} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
   {locations.map((loc, idx) => (
  <Marker
    key={idx}
    position={[loc.lat, loc.lng]}
    icon={L.divIcon({
      className: 'custom-dot-only',
      html: `<div class="dot"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    })}
  >
   <Popup>
  <strong>{loc.name}</strong><br />
  <button onClick={() => deleteLocation(idx)}>🗑 Delete</button>
</Popup>

  </Marker>
))}



    </MapContainer>
  );
}