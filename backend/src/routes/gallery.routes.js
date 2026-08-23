const express = require('express');
const multer = require('multer');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { uploadBuffer, destroyImage } = require('../utils/cloudinary');

const router = express.Router();

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

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

// Public: list all gallery images
router.get('/', async (req, res, next) => {
  try {
    const images = await db.getGalleryImages();
    res.json(images);
  } catch (err) {
    next(err);
  }
});

// Admin: upload a new gallery image (multipart/form-data, field "image", optional "caption")
router.post('/', requireAuth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    try {
      const { url, publicId } = await uploadBuffer(req.file.buffer, { folder: 'rescuedfurworld/gallery' });
      const caption = String(req.body?.caption || '').trim();
      const image = await db.createGalleryImage({ url, publicId, caption });
      res.status(201).json(image);
    } catch (uploadErr) {
      console.error('Cloudinary gallery upload failed:', uploadErr);
      res.status(502).json({ message: 'Image upload to Cloudinary failed.' });
    }
  });
});

// Admin: delete a gallery image (removes from Cloudinary and the database)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await db.getGalleryImageById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Gallery image not found.' });
    }

    await destroyImage(existing.publicId);
    await db.deleteGalleryImage(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
