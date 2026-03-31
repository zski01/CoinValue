require('dotenv').config(); // MUST be first

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('./auth');
const User = require('./models/Users');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => res.send('CoinVault API running'));

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Register attempt:', { username, password }); // debug log

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    console.log('New user saved to MongoDB:', newUser.username); // debug log

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username },
    });
  })(req, res, next);
});

// Profile (GET)
app.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all user data (watchlist + portfolio)
app.get('/user-data', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('watchlist portfolio');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      watchlist: user.watchlist,
      portfolio: Array.from(user.portfolio.entries()), // Map → array for JSON
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user data (watchlist + portfolio)
app.post('/user-data', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { watchlist, portfolio } = req.body;
  console.log('user-data attempt:', req.body, 'for user:', req.user.username); // add this

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (watchlist !== undefined) user.watchlist = watchlist;
    if (portfolio !== undefined) user.portfolio = new Map(portfolio);

    await user.save();
    console.log('user-data saved for:', req.user.username); // add this

    res.json({ message: 'Data updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Proxy CoinGecko to avoid CORS
app.get('/coins/markets', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { ids } = req.query
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
    )
    res.json(response.data)
  } catch (err) {
    res.status(500).json({ error: 'CoinGecko proxy failed' })
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});