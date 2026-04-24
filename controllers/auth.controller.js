const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const transporter = require('../config/email');

// Fonction pour générer un token JWT
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Inscription
exports.inscrire = async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    const utilisateurExistant = await User.findOne({ email });
    if (utilisateurExistant) {
      return res.status(400).json({
        succes: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const motDePasseChiffre = await bcrypt.hash(motDePasse, salt);

    const utilisateur = new User({
      nom,
      email,
      motDePasse: motDePasseChiffre
    });
    await utilisateur.save();

    const token = genererToken(utilisateur._id);

    res.status(201).json({
      succes: true,
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Connexion
exports.connecter = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        succes: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const utilisateur = await User.findOne({ email }).select('+motDePasse');
    if (!utilisateur) {
      return res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const motDePasseCorrect = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!motDePasseCorrect) {
      return res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = genererToken(utilisateur._id);

    res.status(200).json({
      succes: true,
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Profil
exports.moi = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user.id);
    res.status(200).json({
      succes: true,
      utilisateur
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};


// Déconnexion
exports.deconnecter = async (req, res) => {
  try {
    res.status(200).json({
      succes: true,
      message: 'Déconnexion réussie'
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Mot de passe oublié
exports.motDePasseOublie = async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe
    const utilisateur = await User.findOne({ email });
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Aucun compte associé à cet email'
      });
    }

    // Générer un token temporaire
    const token = crypto.randomBytes(32).toString('hex');

    // Sauvegarder le token et son expiration (10 minutes)
    utilisateur.tokenReinitialisation = token;
    utilisateur.expirationToken = Date.now() + 10 * 60 * 1000;
    await utilisateur.save();

    // Créer le lien de réinitialisation
    const lien = `http://127.0.0.1:5501/reinitialiser.html?token=${token}`;

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: utilisateur.email,
      subject: 'Réinitialisation de votre mot de passe - RED PRODUCT',
      html: `
        <h2>Bonjour ${utilisateur.nom}</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${lien}" style="background: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expire dans <strong>10 minutes</strong>.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    });

    res.status(200).json({
      succes: true,
      message: 'Email de réinitialisation envoyé'
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Réinitialiser le mot de passe
exports.reinitialiserMotDePasse = async (req, res) => {
  try {
    const { token, motDePasse } = req.body;

    // Chercher l'utilisateur avec ce token non expiré
    const utilisateur = await User.findOne({
      tokenReinitialisation: token,
      expirationToken: { $gt: Date.now() }
    });

    if (!utilisateur) {
      return res.status(400).json({
        succes: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Chiffrer le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    utilisateur.motDePasse = await bcrypt.hash(motDePasse, salt);

    // Supprimer le token
    utilisateur.tokenReinitialisation = null;
    utilisateur.expirationToken = null;

    await utilisateur.save();

    res.status(200).json({
      succes: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};



/*
Explication :

genererToken → une fonction qu'on réutilise pour créer un token JWT avec l'ID de l'utilisateur dedans
jwt.sign({ id }, secret, { expiresIn }) → crée le token qui expire après 7 jours
req.body → contient les données envoyées par le frontend (nom, email, mot de passe)
User.findOne({ email }) → cherche dans MongoDB si un utilisateur avec cet email existe déjà
User.create() → crée et sauvegarde le nouvel utilisateur dans MongoDB. bcryptjs va automatiquement chiffrer le mot de passe grâce au modèle
select('+motDePasse') → on avait mis select: false dans le modèle pour ne jamais renvoyer le mot de passe. Ici on le force car on en a besoin pour le comparer
bcrypt.compare() → compare le mot de passe saisi avec le mot de passe chiffré dans la base
res.status(201) → 201 veut dire "créé avec succès"
res.status(401) → 401 veut dire "non autorisé"
res.status(500) → 500 veut dire "erreur serveur"
exports.moi → renvoie les infos de l'utilisateur actuellement connecté

Explication :

crypto.randomBytes(32) → génère un token aléatoire de 32 bytes, impossible à deviner
Date.now() + 10 * 60 * 1000 → expiration dans 10 minutes en millisecondes
transporter.sendMail → envoie l'email avec nodemailer
$gt: Date.now() → MongoDB vérifie que le token n'est pas expiré. $gt veut dire "greater than" (supérieur à)
tokenReinitialisation = null → après utilisation on supprime le token pour qu'il ne puisse pas être réutilisé
*/