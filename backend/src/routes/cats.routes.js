const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['Thriving', 'Under care', 'Looking for a home'];

function sanitizeCatPayload(body) {
  const healthJourney = Array.isArray(body.healthJourney)
    ? body.healthJourney
        .filter((event) => event && event.title)
        .map((event) => ({
          date: String(event.date || ''),
          title: String(event.title || ''),
          description: String(event.description || ''),
          type: ['rescue', 'checkup', 'treatment', 'surgery', 'milestone'].includes(event.type)
            ? event.type
            : 'milestone'
        }))
    : [];

  return {
    name: String(body.name || '').trim(),
    emoji: String(body.emoji || '🐱').trim(),
    photo: String(body.photo || '').trim(),
    tagline: String(body.tagline || '').trim(),
    bio: String(body.bio || ''),
    rescueDate: String(body.rescueDate || ''),
    status: VALID_STATUSES.includes(body.status) ? body.status : 'Under care',
    healthJourney
  };
}

// Public: list all cats (supports optional server-side pagination via ?page=&pageSize=)
router.get('/', (req, res) => {
  const all = db.get('cats').value();

  if (req.query.page === undefined && req.query.pageSize === undefined) {
    return res.json(all);
  }

  const total = all.length;
  const pageSize = Math.max(parseInt(req.query.pageSize, 10) || 10, 1);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), totalPages);
  const start = (page - 1) * pageSize;

  res.json({
    items: all.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages
  });
});

// Public: get a single cat
router.get('/:id', (req, res) => {
  const cat = db.get('cats').find({ id: req.params.id }).value();
  if (!cat) {
    return res.status(404).json({ message: 'Cat not found.' });
  }
  res.json(cat);
});

// Admin: create a cat
router.post('/', requireAuth, (req, res) => {
  const payload = sanitizeCatPayload(req.body || {});
  if (!payload.name) {
    return res.status(400).json({ message: 'Cat name is required.' });
  }

  const cat = { id: uuid(), ...payload };
  db.get('cats').push(cat).write();
  res.status(201).json(cat);
});

// Admin: update a cat
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.get('cats').find({ id: req.params.id }).value();
  if (!existing) {
    return res.status(404).json({ message: 'Cat not found.' });
  }

  const payload = sanitizeCatPayload(req.body || {});
  if (!payload.name) {
    return res.status(400).json({ message: 'Cat name is required.' });
  }

  db.get('cats').find({ id: req.params.id }).assign(payload).write();
  res.json(db.get('cats').find({ id: req.params.id }).value());
});

// Admin: delete a cat
router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.get('cats').find({ id: req.params.id }).value();
  if (!existing) {
    return res.status(404).json({ message: 'Cat not found.' });
  }

  db.get('cats').remove({ id: req.params.id }).write();
  res.status(204).end();
});

module.exports = router;
