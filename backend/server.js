require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const wishesRouter = require('./wishes');
app.use('/api/wishes', wishesRouter);

const { router: authRouter, authenticateToken } = require('./auth');
app.use('/api/auth', authRouter);

const photosRouter = require('./photos');
app.use('/api/photos', authenticateToken, photosRouter);


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
