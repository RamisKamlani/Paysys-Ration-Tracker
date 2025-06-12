import MapViewer from './MapViewer';
import { useEffect, useState } from 'react';
import { db } from './db';


export default function App() {
  const [name, setName] = useState('');
  const [locations, setLocations] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // Load all locations from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const all = await db.locations.toArray();
        setLocations(all);
      } catch (error) {
        console.error('Error loading data from DB:', error);
      }
    };
    loadData();
  }, []);

  const captureLocation = () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const newRecord = {
            name,
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
            synced: false
          };
          const id = await db.locations.add(newRecord);
          setLocations((prev) => [...prev, { ...newRecord, id }]);
          alert(`Captured:\n${name}\nLat: ${latitude}\nLng: ${longitude}`);
          setName('');
        } catch (error) {
          console.error('Error capturing location:', error);
          alert('Failed to save location.');
        }
      },
      (err) => alert('Error getting location: ' + err.message)
    );
  };

const syncToServer = async () => {
  try {
    const all = await db.locations.toArray();
    const unsynced = all.filter((l) => l.synced === false);

    if (unsynced.length === 0) {
      alert('All data already synced!');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to transfer this data?');
    if (!confirmed) return;

    const response = await fetch('http://localhost:5000/api/locations/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(unsynced)
    });

    if (!response.ok) throw new Error('Server error');

    // Mark all as synced
    for (let record of unsynced) {
      await db.locations.update(record.id, { synced: true });
    }

    const updated = await db.locations.toArray();
    setLocations(updated);

    alert(`${unsynced.length} location(s) synced successfully!`);
  } catch (error) {
    console.error('Sync failed:', error);
    alert('Failed to sync data.');
  }
};


const deleteLocation = async (id) => {
  const confirmed = window.confirm('Are you sure you want to delete this location from the local device?');
  if (!confirmed) return;

  try {
    await db.locations.delete(id);
    const updated = await db.locations.toArray();
    setLocations(updated);
    alert('Location deleted successfully.');
  } catch (error) {
    console.error('Failed to delete location:', error);
    alert('Something went wrong while deleting.');
  }
};


  const handleKeyDown = (e) => { 
    if (e.key === 'Enter') {
      captureLocation();
    }
  };

  try {
    return (
      <div className="container">
        <img src="/paysys.jpg" alt="Paysys Labs Logo" className="top-logo" />

        <h1 className="main-title">📍 Ration Location Tracker - Paysys </h1>

        <section className="card">
          <div className="card-header">1️⃣ Capture Location</div>
          <input
            type="text"
            placeholder="Person / House Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={captureLocation}>📌 Capture Location</button>
        </section>

        <section className="card">
          <div className="card-header">2️⃣ Sync to Server</div>
          <button onClick={syncToServer}>🔄 Transfer Data</button>
        </section>


        <section className="card">
          <div className="card-header">📋 Captured Data</div>
          {locations.length === 0 ? (
            <p>No data captured yet.</p>
          ) : (
            <ul className="location-list">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <strong>{loc.name}</strong><br />
                  Lat: {loc.lat ? loc.lat.toFixed(4) : 'N/A'}, Lng: {loc.lng ? loc.lng.toFixed(4) : 'N/A'}<br />
                  {loc.synced ? '✅ Synced' : '❌ Not Synced'}
                  <br />
                  <button
                    onClick={() => deleteLocation(loc.id)}
                    style={{ marginTop: '6px', backgroundColor: 'crimson' }}
                  >
                    🗑️ Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
  <div className="card-header">🗺️ View Synced Locations</div>
  <button onClick={() => setShowMap(!showMap)}>
    {showMap ? 'Hide Map' : 'Show Map'}
  </button>
  {showMap && (
    <div className="map-box">
      <MapViewer />
    </div>
  )}
</section>
      </div>
    );
  } catch (error) {
    console.error('App crashed:', error);
    return <div style={{ padding: '20px', color: 'red' }}>Something went wrong. Check console.</div>;
  }
}