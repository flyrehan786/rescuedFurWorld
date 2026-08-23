const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await db.getUser(username);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, username: user.username, photo: user.photo || '' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db.getUser(req.user.username);
    res.json({ username: user.username, photo: user.photo || '' });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { username: newUsername, photo } = req.body || {};
    const trimmedUsername = newUsername !== undefined ? String(newUsername).trim() : undefined;

    if (trimmedUsername !== undefined && !trimmedUsername) {
      return res.status(400).json({ message: 'Username cannot be empty.' });
    }

    if (trimmedUsername && trimmedUsername !== req.user.username) {
      const existing = await db.getUser(trimmedUsername);
      if (existing) {
        return res.status(409).json({ message: 'That username is already taken.' });
      }
    }

    const updated = await db.updateProfile(req.user.username, {
      newUsername: trimmedUsername,
      photo: photo !== undefined ? String(photo).trim() : undefined
    });

    const token = jwt.sign({ username: updated.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, username: updated.username, photo: updated.photo || '' });
  } catch (err) {
    next(err);
  }
});

router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await db.getUser(req.user.username);
    if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    await db.updatePassword(user.username, bcrypt.hashSync(newPassword, 10));
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
