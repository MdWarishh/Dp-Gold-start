const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5173'], // add your frontend URLs
  credentials: true
}));

// FIXED: Remove deprecated options
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
  res.json({ status: "Backend Live" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));