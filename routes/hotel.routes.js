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

// Routes publiques
router.get('/', obtenirHotels);
router.get('/:id', obtenirHotel);

// Routes protégées
router.post('/', proteger, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        succes: false,
        message: err.message
      });
    }
    next();
  });
}, creerHotel);

router.put('/:id', proteger, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        succes: false,
        message: err.message
      });
    }
    next();
  });
}, modifierHotel);

router.delete('/:id', proteger, supprimerHotel);

module.exports = router;

/*


Explication :

router.get('/') → publique, tout le monde peut voir les hôtels sans être connecté
router.get('/:id') → publique, tout le monde peut voir un hôtel
proteger → pour créer, modifier ou supprimer, il faut être connecté
upload.single('image') → Multer traite l'image avant que le controller s'exécute. single veut dire qu'on attend une seule image avec le champ nommé image
/:id → le :id est une partie dynamique de l'URL. Par exemple /api/hotels/123 ou /api/hotels/abc

*/