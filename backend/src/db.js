const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rescued_fur_world',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

const seedCats = [
  {
    id: 'milo',
    name: 'Milo',
    emoji: '🐱',
    photo: '',
    tagline: 'Found under a car in the rain, now rules the couch.',
    bio: '<p>Milo was a tiny, soaked kitten when he was found sheltering under a parked car. He was underweight and had an eye infection. Months of care later, he is a confident, cuddly house cat who loves sunny windowsills.</p>',
    rescueDate: '2022-03-14',
    status: 'Thriving',
    healthJourney: [
      { date: '2022-03-14', title: 'Rescued', description: 'Found alone under a car, cold and underweight.', type: 'rescue' },
      { date: '2022-03-16', title: 'First vet visit', description: 'Treated for an eye infection and mild dehydration.', type: 'checkup' },
      { date: '2022-04-02', title: 'Vaccinations started', description: 'First round of core vaccines and deworming.', type: 'treatment' },
      { date: '2022-06-10', title: 'Neutered', description: 'Routine spay/neuter surgery, recovered within a week.', type: 'surgery' },
      { date: '2022-09-01', title: 'Full health clearance', description: 'Vet confirmed healthy weight and no lingering issues.', type: 'milestone' }
    ]
  },
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🐈',
    photo: '',
    tagline: 'A shy stray who learned to trust again.',
    bio: '<p>Luna was rescued from a construction site with a leg injury. She was terrified of people at first. With patience, a safe space, and consistent care, she slowly came out of her shell.</p>',
    rescueDate: '2021-11-02',
    status: 'Thriving',
    healthJourney: [
      { date: '2021-11-02', title: 'Rescued', description: 'Found limping near a construction site.', type: 'rescue' },
      { date: '2021-11-03', title: 'X-ray & splint', description: 'Minor leg fracture diagnosed, splint applied.', type: 'treatment' },
      { date: '2021-12-15', title: 'Splint removed', description: 'Leg healed well, full mobility restored.', type: 'checkup' },
      { date: '2022-02-20', title: 'Spayed', description: 'Routine spay surgery completed successfully.', type: 'surgery' },
      { date: '2022-05-05', title: 'First time being petted', description: 'A huge trust milestone after months of gentle care.', type: 'milestone' }
    ]
  },
  {
    id: 'simba',
    name: 'Simba',
    emoji: '🐈‍⬛',
    photo: '',
    tagline: 'Senior cat with a heart condition, living his best life.',
    bio: '<p>Simba came to us as a senior cat with a heart murmur and needed ongoing monitoring. With the right medication and regular checkups, he is stable, affectionate, and loves napping in warm laundry baskets.</p>',
    rescueDate: '2023-01-20',
    status: 'Under care',
    healthJourney: [
      { date: '2023-01-20', title: 'Rescued', description: 'Elderly stray found weak and thin.', type: 'rescue' },
      { date: '2023-01-22', title: 'Diagnosed with heart murmur', description: 'Cardiology checkup revealed a grade II murmur.', type: 'checkup' },
      { date: '2023-02-01', title: 'Medication started', description: 'Began daily heart medication and special diet.', type: 'treatment' },
      { date: '2023-07-15', title: 'Six-month recheck', description: 'Condition stable, no worsening on follow-up echo.', type: 'checkup' },
      { date: '2024-01-15', title: 'One year strong', description: 'Celebrating a full year of stable health.', type: 'milestone' }
    ]
  }
];

async function insertHealthEvents(catId, events) {
  if (!events || !events.length) return;
  const values = events.map((e) => [catId, e.date || '', e.title || '', e.description || '', e.type || 'milestone']);
  await pool.query(
    'INSERT INTO health_events (cat_id, event_date, title, description, type) VALUES ?',
    [values]
  );
}

async function insertCatRow(cat) {
  await pool.query(
    'INSERT INTO cats (id, name, emoji, photo, tagline, bio, rescue_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [cat.id, cat.name, cat.emoji, cat.photo || '', cat.tagline, cat.bio, cat.rescueDate, cat.status]
  );
  await insertHealthEvents(cat.id, cat.healthJourney);
}

// Guards against re-running schema/seed setup on every request (serverless cold starts reuse this module).
let readyPromise = null;

const DB_NAME = process.env.DB_NAME || 'rescued_fur_world';

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  } finally {
    await connection.end();
  }
}

async function setup() {
  await ensureDatabaseExists();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cats (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      emoji VARCHAR(16),
      photo VARCHAR(1024),
      tagline VARCHAR(500),
      bio TEXT,
      rescue_date VARCHAR(32),
      status VARCHAR(64)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS health_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cat_id VARCHAR(64) NOT NULL,
      event_date VARCHAR(32),
      title VARCHAR(255),
      description TEXT,
      type VARCHAR(32),
      FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE
    )
  `);

  const [[{ count: userCount }]] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
    await pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [DEFAULT_ADMIN_USERNAME, passwordHash]);
  }

  const [[{ count: catCount }]] = await pool.query('SELECT COUNT(*) AS count FROM cats');
  if (catCount === 0) {
    for (const cat of seedCats) {
      await insertCatRow(cat);
    }
  }
}

function ensureReady() {
  if (!readyPromise) {
    readyPromise = setup().catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}

function rowToCat(row, healthJourney) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    photo: row.photo,
    tagline: row.tagline,
    bio: row.bio,
    rescueDate: row.rescue_date,
    status: row.status,
    healthJourney
  };
}

function eventsToJourney(rows) {
  return rows.map((e) => ({ date: e.event_date, title: e.title, description: e.description, type: e.type }));
}

async function getUser(username) {
  const [rows] = username
    ? await pool.query('SELECT username, password_hash AS passwordHash FROM users WHERE username = ? LIMIT 1', [username])
    : await pool.query('SELECT username, password_hash AS passwordHash FROM users LIMIT 1');
  return rows[0] || null;
}

async function updatePassword(username, passwordHash) {
  await pool.query('UPDATE users SET password_hash = ? WHERE username = ?', [passwordHash, username]);
}

async function getCats() {
  const [catRows] = await pool.query('SELECT * FROM cats ORDER BY rescue_date');
  const [eventRows] = await pool.query('SELECT * FROM health_events ORDER BY event_date');
  const eventsByCat = {};
  for (const e of eventRows) {
    (eventsByCat[e.cat_id] = eventsByCat[e.cat_id] || []).push(e);
  }
  return catRows.map((row) => rowToCat(row, eventsToJourney(eventsByCat[row.id] || [])));
}

async function getCatById(id) {
  const [catRows] = await pool.query('SELECT * FROM cats WHERE id = ?', [id]);
  if (!catRows[0]) return null;
  const [eventRows] = await pool.query('SELECT * FROM health_events WHERE cat_id = ? ORDER BY event_date', [id]);
  return rowToCat(catRows[0], eventsToJourney(eventRows));
}

async function createCat(payload) {
  const cat = { id: uuid(), ...payload };
  await insertCatRow(cat);
  return getCatById(cat.id);
}

async function updateCat(id, payload) {
  await pool.query(
    'UPDATE cats SET name = ?, emoji = ?, photo = ?, tagline = ?, bio = ?, rescue_date = ?, status = ? WHERE id = ?',
    [payload.name, payload.emoji, payload.photo || '', payload.tagline, payload.bio, payload.rescueDate, payload.status, id]
  );
  await pool.query('DELETE FROM health_events WHERE cat_id = ?', [id]);
  await insertHealthEvents(id, payload.healthJourney);
  return getCatById(id);
}

async function deleteCat(id) {
  await pool.query('DELETE FROM cats WHERE id = ?', [id]);
}

module.exports = {
  pool,
  ensureReady,
  getUser,
  updatePassword,
  getCats,
  getCatById,
  createCat,
  updateCat,
  deleteCat
};
