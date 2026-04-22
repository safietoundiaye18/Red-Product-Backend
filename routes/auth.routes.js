const express = require('express');
const router = express.Router();
const { inscrire, connecter, moi, deconnecter, motDePasseOublie, reinitialiserMotDePasse } = require('../controllers/auth.controller');
const { proteger } = require('../middleware/auth');

// Route inscription
router.post('/inscription', inscrire);

// Route connexion
router.post('/connexion', connecter);

// Route profil (protégée)
router.get('/moi', proteger, moi);

// Route déconnexion (protégée)
router.post('/deconnexion', proteger, deconnecter);

// Route mot de passe oublié
router.post('/mot-de-passe-oublie', motDePasseOublie);

// Route réinitialiser mot de passe
router.post('/reinitialiser-mot-de-passe', reinitialiserMotDePasse);

module.exports = router;

/*

Explication :

express.Router() → crée un mini routeur Express dédié à l'authentification
require('../controllers/auth.controller') → on importe les fonctions qu'on vient de créer
router.post('/inscription', inscrire) → quand le frontend appelle POST /api/auth/inscription, la fonction inscrire s'exécute
router.post('/connexion', connecter) → quand le frontend appelle POST /api/auth/connexion, la fonction connecter s'exécute
router.get('/moi', proteger, moi) → ici on a deux middlewares : d'abord proteger vérifie le token, ensuite seulement moi s'exécute. Si le token est invalide, moi ne s'exécute jamais
 */