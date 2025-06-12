import Dexie from 'dexie';

export const db = new Dexie('RationDB');

// Add 'synced' as an index
db.version(2).stores({
  locations: '++id, name, lat, lng, timestamp, synced'
});