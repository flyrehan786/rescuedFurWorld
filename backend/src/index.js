const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const config = require('./config');
const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const catsRoutes = require('./routes/cats.routes');
const uploadRoutes = require('./routes/upload.routes');
const galleryRoutes = require('./routes/gallery.routes');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Ensures MySQL schema/seed setup has run before any route touches the db.
app.use(async (req, res, next) => {
  try {
    await db.ensureReady();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/cats', catsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`RescuedFurWorld API server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
