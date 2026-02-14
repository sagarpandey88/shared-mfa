const express = require('express');
const passport = require('passport');
const router = express.Router();

// Microsoft OAuth login
router.get('/microsoft', passport.authenticate('microsoft', {
  prompt: 'select_account',
}));

// Microsoft OAuth callback
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;
