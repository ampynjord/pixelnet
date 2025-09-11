import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à la BDD MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelnet';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Stockage en mémoire des IPs et leur dernier placement (cooldown)
const ipCooldowns = new Map();
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes en millisecondes

// Fonction pour obtenir l'IP réelle du client
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Middleware pour vérifier le cooldown IP
function checkIPCooldown(req, res, next) {
  const clientIP = getClientIP(req);
  const now = Date.now();
  const lastPlacement = ipCooldowns.get(clientIP);
  
  if (lastPlacement && (now - lastPlacement) < COOLDOWN_TIME) {
    const remainingTime = COOLDOWN_TIME - (now - lastPlacement);
    return res.status(429).json({ 
      error: 'Cooldown actif',
      message: 'Vous devez attendre avant de placer un autre pixel',
      remainingTime: Math.ceil(remainingTime / 1000), // en secondes
      cooldownTime: COOLDOWN_TIME / 1000 // durée totale du cooldown en secondes
    });
  }
  
  next();
}

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
  owner: String,
  timestamp: { type: Date, default: Date.now }
}));

// Route racine - Information sur l'API
app.get('/', (req, res) => {
  res.json({
    name: 'Pixelnet API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'GET /api/pixels': 'Récupérer tous les pixels',
      'POST /api/pixels': 'Placer un nouveau pixel',
      'GET /api/cooldown': 'Vérifier le statut du cooldown'
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes API
app.get('/api/pixels', async (req, res) => {
  const pixels = await Pixel.find();
  res.json(pixels);
});

// Route pour vérifier le statut du cooldown d'une IP
app.get('/api/cooldown', (req, res) => {
  const clientIP = getClientIP(req);
  const now = Date.now();
  const lastPlacement = ipCooldowns.get(clientIP);
  
  if (lastPlacement && (now - lastPlacement) < COOLDOWN_TIME) {
    const remainingTime = COOLDOWN_TIME - (now - lastPlacement);
    res.json({
      inCooldown: true,
      remainingTime: Math.ceil(remainingTime / 1000),
      cooldownTime: COOLDOWN_TIME / 1000
    });
  } else {
    res.json({
      inCooldown: false,
      remainingTime: 0,
      cooldownTime: COOLDOWN_TIME / 1000
    });
  }
});

app.post('/api/pixels', checkIPCooldown, async (req, res) => {
  try {
    const { x, y, color } = req.body;
    const clientIP = getClientIP(req);
    
    // Vérifier que les coordonnées sont valides
    if (typeof x !== 'number' || typeof y !== 'number' || !color) {
      return res.status(400).json({ error: 'Données invalides' });
    }
    
    // Supprimer l'ancien pixel à cette position (s'il existe)
    await Pixel.deleteOne({ x, y });
    
    // Créer le nouveau pixel
    const pixel = new Pixel({ 
      x, 
      y, 
      color, 
      owner: `IP_${clientIP.replace(/[:.]/g, '_')}`, // Anonymiser l'IP
      timestamp: new Date()
    });
    
    await pixel.save();
    
    // Enregistrer le timestamp pour le cooldown
    ipCooldowns.set(clientIP, Date.now());
    
    res.json({ 
      success: true, 
      pixel,
      message: 'Pixel placé avec succès !',
      cooldownTime: COOLDOWN_TIME / 1000
    });
    
  } catch (error) {
    console.error('Erreur lors du placement du pixel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend PixelNet démarré sur le port ${PORT}`);
});
