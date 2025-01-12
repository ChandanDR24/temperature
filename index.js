const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg'); // Import PostgreSQL client

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://temp_5nu1_user:hA21MUJK9khsyFMt59EfwiBtI2ygoBab@dpg-cu1sitggph6c73el2rc0-a/temp_5nu1',
  ssl: { rejectUnauthorized: false }, // Necessary for some cloud-hosted databases
});

// Serve frontend from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/update', async (req, res) => {
  const { temperature, humidity } = req.body;

  if (typeof temperature === 'number' && typeof humidity === 'number') {
    try {
      // Insert data into PostgreSQL
      await pool.query('INSERT INTO sensor_data (temperature, humidity) VALUES ($1, $2)', [temperature, humidity]);
      console.log(`Data saved: Temperature = ${temperature}, Humidity = ${humidity}`);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(400).json({ error: 'Invalid data format' });
  }
});

app.get('/api/sensor-data', async (req, res) => {
  try {
    const result = await pool.query('SELECT temperature, humidity, created_at FROM sensor_data ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));