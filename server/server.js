const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Endpoints
let savedLocations = [];

app.post('/api/locations/bulk', (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).send('Invalid format. Expected an array.');
  }
  savedLocations.push(...data);
  console.log(`Received ${data.length} new location(s).`);
  res.status(200).send({ message: 'Success', count: data.length });
});

app.get('/api/locations', (req, res) => {
  res.status(200).json(savedLocations);
});

app.delete('/api/locations/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0 || index >= savedLocations.length) {
    return res.status(404).send({ message: 'Invalid index' });
  }
  const removed = savedLocations.splice(index, 1);
  console.log(`Deleted location at index ${index}:`, removed[0]);
  res.send({ message: 'Deleted', removed: removed[0] });
});

// ✅ Serve React static files
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ Fallback: serve index.html for any other route (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
