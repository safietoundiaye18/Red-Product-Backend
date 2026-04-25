const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const connecterDB = require('./config/db');

const app = express();

// Trust proxy pour Render
app.set('trust proxy', 1);

// Connexion à MongoDB
connecterDB();

// Sécurité avec Helmet
app.use(helmet());

// Limite de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes maximum par IP
  message: {
    succes: false,
    message: 'Trop de requêtes, veuillez réessayer dans 15 minutes'
  }
});
app.use('/api', limiter);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre le dossier uploads accessible publiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/hotels', require('./routes/hotel.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API RED PRODUCT en ligne ✅' });
});


// Middleware gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    succes: false,
    message: err.message || 'Erreur serveur interne'
  });
});

// Route introuvable
app.use((req, res) => {
  res.status(404).json({
    succes: false,
    message: 'Route introuvable'
  });
});


// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});


/*Explication ligne par ligne :

require('dotenv').config() → charge les variables de votre fichier .env en premier, avant tout le reste
connecterDB() → appelle la fonction qu'on vient de créer dans config/db.js pour connecter MongoDB
app.use(cors()) → autorise le frontend à appeler l'API
app.use(express.json()) → permet à Express de lire les données JSON envoyées par le frontend
app.use(express.urlencoded()) → permet de lire les données envoyées depuis un formulaire HTML
app.use('/uploads', express.static(...)) → rend les images du dossier uploads/ accessibles via une URL comme localhost:5000/uploads/monimage.jpg
app.get('/') → une route de test pour vérifier que le serveur fonctionne
app.listen(PORT) → démarre le serveur et écoute sur le port 5000


Explication des nouveaux éléments :

helmet() → active toutes les protections de sécurité en une ligne
rateLimit → limite à 100 requêtes par IP toutes les 15 minutes
windowMs: 15 * 60 * 1000 → 15 minutes en millisecondes
max: 100 → maximum 100 requêtes par IP
app.use((err, req, res, next)) → middleware global qui attrape toutes les erreurs non gérées
app.use('*') → si une URL n'existe pas, renvoie une erreur 404
*/
