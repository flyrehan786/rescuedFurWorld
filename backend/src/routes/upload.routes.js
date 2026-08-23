const express = require('express');
const multer = require('multer');
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

// Admin: upload a cat photo or a rich-text/bio embedded image to Cloudinary.
router.post('/image', requireAuth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    try {
      const { url, publicId } = await uploadBuffer(req.file.buffer, { folder: 'rescuedfurworld/cats' });
      res.status(201).json({ url, publicId });
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr);
      res.status(502).json({ message: 'Image upload to Cloudinary failed.' });
    }
  });
});

// Admin: remove a previously uploaded image from Cloudinary (e.g. when a photo is replaced/removed).
router.delete('/image', requireAuth, async (req, res) => {
  const { publicId } = req.body || {};
  if (!publicId) {
    return res.status(400).json({ message: 'publicId is required.' });
  }

  try {
    await destroyImage(publicId);
    res.status(204).end();
  } catch (err) {
    console.error('Cloudinary delete failed:', err);
    res.status(502).json({ message: 'Failed to delete image from Cloudinary.' });
  }
});

module.exports = router;
