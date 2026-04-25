const express = require('express');
const router = express.Router();
const {
  obtenirHotels,
  obtenirHotel,
  creerHotel,
  modifierHotel,
  supprimerHotel
} = require('../controllers/hotel.controller');
const { proteger } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Toutes les routes sont protégées
router.get('/', obtenirHotels);
router.get('/:id', obtenirHotel);

router.post('/', proteger, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ succes: false, message: err.message });
    next();
  });
}, creerHotel);

router.put('/:id', proteger, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ succes: false, message: err.message });
    next();
  });
}, modifierHotel);

router.delete('/:id', proteger, supprimerHotel);

module.exports = router;