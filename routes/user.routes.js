const express = require('express');
const router = express.Router();
const { obtenirProfil, modifierProfil, modifierMotDePasse } = require('../controllers/user.controller');
const { proteger } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profil', proteger, obtenirProfil);

router.put('/profil', proteger, (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) return res.status(400).json({ succes: false, message: err.message });
        next();
    });
}, modifierProfil);

router.put('/mot-de-passe', proteger, modifierMotDePasse);

module.exports = router;