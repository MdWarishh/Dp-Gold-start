const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();



// Routes
const adminRoutes = require('./routes/adminRoutes');
const gameRoutes = require('./routes/adminRoutes'); // 👈 Import new routes


app.use(express.json());
app.use(cors({
 origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://dp-gold-start-frontend.vercel.app',
    'https://dp-gold-start-frontend.vercel.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

// FIXED: Remove deprecated options
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });


app.use('/api/admin', adminRoutes);
app.use('/api/player', gameRoutes);

app.get('/', (req, res) => {
  res.json({ status: "Backend Live" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));