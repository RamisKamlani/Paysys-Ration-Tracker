const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Temporary in-memory store
let savedLocations = [];

app.use(cors());
app.use(bodyParser.json());

// POST endpoint to receive locations
app.post('/api/locations/bulk', (req, res) => {
  const data = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).send('Invalid format. Expected an array.');
  }

  savedLocations.push(...data);
  console.log(`Received ${data.length} new location(s).`);
  res.status(200).send({ message: 'Success', count: data.length });
});

// GET endpoint to return saved locations
app.get('/api/locations', (req, res) => {
  res.status(200).json(savedLocations);
});

// DELETE a location by index (or add real IDs later)
app.delete('/api/locations/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0 || index >= savedLocations.length) {
    return res.status(404).send({ message: 'Invalid index' });
  }

  const removed = savedLocations.splice(index, 1);
  console.log(`Deleted location at index ${index}:`, removed[0]);
  res.send({ message: 'Deleted', removed: removed[0] });
});


app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});


