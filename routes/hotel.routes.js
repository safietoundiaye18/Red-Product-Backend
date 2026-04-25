const express = require('express');
const router = express.Router();
const {
  obtenirHotels,
  obtenirHotel,
  creerHotel,
  modifierHotel,
  supprimerHotel
} = require('../controllers/hotel.controller');
const { proteger, autoriser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Routes publiques
router.get('/', obtenirHotels);
router.get('/:id', obtenirHotel);

// Routes admin seulement
router.post('/', proteger, autoriser('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ succes: false, message: err.message });
    next();
  });
}, creerHotel);

router.put('/:id', proteger, autoriser('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ succes: false, message: err.message });
    next();
  });
}, modifierHotel);

router.delete('/:id', proteger, autoriser('admin'), supprimerHotel);

module.exports = router;