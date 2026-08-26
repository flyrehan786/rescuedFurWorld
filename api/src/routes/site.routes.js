const express = require('express');
const multer = require('multer');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { uploadBuffer, destroyImage } = require('../utils/cloudinary');

const router = express.Router();

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const ALLOWED_KEYS = new Set(['about-photo']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error('Only PNG, JPEG, GIF, or WEBP images are allowed.'));
    }
    cb(null, true);
  }
});

function requireKnownKey(req, res, next) {
  if (!ALLOWED_KEYS.has(req.params.key)) {
    return res.status(404).json({ message: 'Unknown site setting.' });
  }
  next();
}

// Public: get a site content image (e.g. the About section photo)
router.get('/:key', requireKnownKey, async (req, res, next) => {
  try {
    const setting = await db.getSiteSetting(req.params.key);
    res.json({ url: setting?.value || '' });
  } catch (err) {
    next(err);
  }
});

// Admin: replace a site content image (multipart/form-data, field "image")
router.put('/:key', requireAuth, requireKnownKey, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    try {
      const existing = await db.getSiteSetting(req.params.key);
      const { url, publicId } = await uploadBuffer(req.file.buffer, { folder: 'rescuedFurWorld/site' });
      await db.setSiteSetting(req.params.key, { value: url, publicId });
      if (existing?.publicId) {
        await destroyImage(existing.publicId);
      }
      res.json({ url });
    } catch (uploadErr) {
      console.error('Cloudinary site image upload failed:', uploadErr);
      res.status(502).json({ message: 'Image upload to Cloudinary failed.' });
    }
  });
});

module.exports = router;
