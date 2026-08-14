const express = require('express');
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
router.get('/', async (req, res, next) => {
  try {
    const all = await db.getCats();

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
  } catch (err) {
    next(err);
  }
});

// Public: get a single cat
router.get('/:id', async (req, res, next) => {
  try {
    const cat = await db.getCatById(req.params.id);
    if (!cat) {
      return res.status(404).json({ message: 'Cat not found.' });
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

// Admin: create a cat
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = sanitizeCatPayload(req.body || {});
    if (!payload.name) {
      return res.status(400).json({ message: 'Cat name is required.' });
    }

    const cat = await db.createCat(payload);
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
});

// Admin: update a cat
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await db.getCatById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Cat not found.' });
    }

    const payload = sanitizeCatPayload(req.body || {});
    if (!payload.name) {
      return res.status(400).json({ message: 'Cat name is required.' });
    }

    const updated = await db.updateCat(req.params.id, payload);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Admin: delete a cat
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await db.getCatById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Cat not found.' });
    }

    await db.deleteCat(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
