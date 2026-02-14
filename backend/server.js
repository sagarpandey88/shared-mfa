const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const cookieParser = require('cookie-parser');
require('dotenv').config();

const db = require('./db');
const mfaRoutes = require('./routes/mfa');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Microsoft Strategy
passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID || 'demo-client-id',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'demo-client-secret',
    callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3001/auth/microsoft/callback',
    scope: ['user.read']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Check if user exists
      const userResult = await db.query(
        'SELECT * FROM users WHERE microsoft_id = $1',
        [profile.id]
      );

      let user;
      if (userResult.rows.length === 0) {
        // Create new user
        const insertResult = await db.query(
          'INSERT INTO users (microsoft_id, email, name) VALUES ($1, $2, $3) RETURNING *',
          [profile.id, profile.emails[0].value, profile.displayName]
        );
        user = insertResult.rows[0];
      } else {
        user = userResult.rows[0];
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/mfa', mfaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
