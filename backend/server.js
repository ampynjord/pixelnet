import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à la BDD MongoDB
mongoose.connect('mongodb://localhost:27017/pixelwar', { useNewUrlParser: true, useUnifiedTopology: true });

// Modèles de base
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  score: Number
}));
const Pixel = mongoose.model('Pixel', new mongoose.Schema({
  x: Number,
  y: Number,
  color: String,
  owner: String
}));

// Routes API (exemple)
app.get('/api/pixels', async (req, res) => {
  const pixels = await Pixel.find();
  res.json(pixels);
});

app.post('/api/pixels', async (req, res) => {
  const { x, y, color, owner } = req.body;
  const pixel = new Pixel({ x, y, color, owner });
  await pixel.save();
  res.json(pixel);
});

app.listen(3001, () => {
  console.log('Backend PixelWar démarré sur le port 3001');
});
