const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../db');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all MFA accounts for current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, issuer, created_at FROM mfa_accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching MFA accounts:', error);
    res.status(500).json({ error: 'Failed to fetch MFA accounts' });
  }
});

// Get TOTP token for a specific MFA account
router.get('/:id/token', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT secret FROM mfa_accounts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'MFA account not found' });
    }

    const secret = result.rows[0].secret;
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
    });

    const remainingTime = 30 - Math.floor((Date.now() / 1000) % 30);

    res.json({
      token,
      remainingTime,
    });
  } catch (error) {
    console.error('Error generating TOTP:', error);
    res.status(500).json({ error: 'Failed to generate TOTP' });
  }
});

// Add new MFA account (manual entry)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, secret, issuer } = req.body;

    if (!name || !secret) {
      return res.status(400).json({ error: 'Name and secret are required' });
    }

    // Validate secret format (base32)
    const base32Regex = /^[A-Z2-7]+=*$/i;
    if (!base32Regex.test(secret)) {
      return res.status(400).json({ error: 'Invalid secret format. Must be base32 encoded.' });
    }

    // Verify the secret works
    try {
      speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid secret. Could not generate token.' });
    }

    const result = await db.query(
      'INSERT INTO mfa_accounts (user_id, name, secret, issuer) VALUES ($1, $2, $3, $4) RETURNING id, name, issuer, created_at',
      [req.user.id, name, secret, issuer || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding MFA account:', error);
    res.status(500).json({ error: 'Failed to add MFA account' });
  }
});

// Parse QR code data and add MFA account
router.post('/from-qr', isAuthenticated, async (req, res) => {
  try {
    const { qrData, customName } = req.body;

    if (!qrData) {
      return res.status(400).json({ error: 'QR code data is required' });
    }

    // Parse otpauth:// URL
    // Format: otpauth://totp/Issuer:Account?secret=SECRET&issuer=Issuer
    const otpauthRegex = /otpauth:\/\/totp\/([^?]+)\?(.+)/;
    const match = qrData.match(otpauthRegex);

    if (!match) {
      return res.status(400).json({ error: 'Invalid OTP Auth URL format' });
    }

    const label = decodeURIComponent(match[1]);
    const params = new URLSearchParams(match[2]);
    const secret = params.get('secret');
    const issuer = params.get('issuer');

    if (!secret) {
      return res.status(400).json({ error: 'Secret not found in QR code' });
    }

    // Use custom name if provided, otherwise use label from QR
    const name = customName || label;

    // Verify the secret works
    try {
      speakeasy.totp({
        secret: secret,
        encoding: 'base32',
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid secret from QR code' });
    }

    const result = await db.query(
      'INSERT INTO mfa_accounts (user_id, name, secret, issuer) VALUES ($1, $2, $3, $4) RETURNING id, name, issuer, created_at',
      [req.user.id, name, secret, issuer || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding MFA from QR:', error);
    res.status(500).json({ error: 'Failed to add MFA account from QR code' });
  }
});

// Delete MFA account
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM mfa_accounts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'MFA account not found' });
    }

    res.json({ message: 'MFA account deleted successfully' });
  } catch (error) {
    console.error('Error deleting MFA account:', error);
    res.status(500).json({ error: 'Failed to delete MFA account' });
  }
});

module.exports = router;
