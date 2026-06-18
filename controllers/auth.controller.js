const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const resend = require('../config/email');
const brevo = require('../config/brevo');

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

    const tokenActivation = crypto.randomBytes(32).toString('hex');

    const utilisateur = new User({
      nom,
      email,
      motDePasse: motDePasseChiffre,
      estActif: false,
      tokenActivation
    });
    await utilisateur.save();

    const lien = `https://red-product-backend-z5lx.onrender.com/api/auth/activer/${tokenActivation}`;

    try {
      await brevo.sendMail({
        from: process.env.EMAIL_FROM,
        to: utilisateur.email,
        subject: 'Activez votre compte - RED PRODUCT',
        html: `
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4" style="padding: 40px 0;">
  <tr>
    <td align="center">
      <table width="500" cellpadding="30" cellspacing="0" bgcolor="#ffffff" style="border: 1px solid #dddddd;">
        <tr>
          <td align="center" bgcolor="#dc2626" style="padding: 30px;">
            <h1 style="color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; margin: 0;">
              RED PRODUCT
            </h1>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 40px 30px;">
            <h2 style="color: #111827; font-family: Arial, sans-serif; font-size: 22px; margin: 0 0 20px 0;">
              Bonjour ${utilisateur.nom} 👋
            </h2>
            <p style="color: #4b5563; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Merci de vous être inscrit sur <strong>RED PRODUCT</strong>.
            </p>
            <p style="color: #4b5563; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Cliquez sur le bouton ci-dessous pour activer votre compte.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" bgcolor="#dc2626" style="padding: 14px 28px;">
                  <a href="${lien}" style="color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 16px;">
                    Activer mon compte
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #9ca3af; font-family: Arial, sans-serif; font-size: 13px; margin: 30px 0 0 0;">
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="#f8f8f8" style="padding: 20px; border-top: 1px solid #eeeeee;">
            <p style="color: #9ca3af; font-family: Arial, sans-serif; font-size: 12px; margin: 0;">
              © 2026 RED PRODUCT. Tous droits réservés.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
        `
      });
      console.log('Email activation envoyé à :', utilisateur.email);
    } catch (emailErreur) {
      console.error('Erreur envoi email activation:', emailErreur);
    }

    res.status(201).json({
      succes: true,
      message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.'
    });
  } catch (erreur) {
    console.error('Erreur inscription:', erreur);
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Activer le compte
exports.activerCompte = async (req, res) => {
  try {
    const { token } = req.params;

    const utilisateur = await User.findOne({ tokenActivation: token });

    if (!utilisateur) {
      return res.status(400).json({
        succes: false,
        message: 'Token d\'activation invalide ou déjà utilisé'
      });
    }

    utilisateur.estActif = true;
    utilisateur.tokenActivation = null;
    await utilisateur.save();

    res.redirect(`https://red-product-one.vercel.app/index.html?activated=true`);

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

    if (!utilisateur.estActif) {
      return res.status(401).json({
        succes: false,
        message: 'Veuillez activer votre compte. Vérifiez votre email.'
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

    const utilisateur = await User.findOne({ email });
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Aucun compte associé à cet email'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    utilisateur.tokenReinitialisation = token;
    utilisateur.expirationToken = Date.now() + 10 * 60 * 1000;
    await utilisateur.save();

    const lien = `https://red-product-one.vercel.app/reinitialiser.html?token=${token}`;

    await resend.emails.send({
      from: 'RED PRODUCT <onboarding@resend.dev>',
      to: utilisateur.email,
      subject: 'Réinitialisation de votre mot de passe - RED PRODUCT',
      html: `
        <h2>Bonjour ${utilisateur.nom}</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <a href="${lien}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expire dans 10 minutes.</p>
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

    const salt = await bcrypt.genSalt(10);
    utilisateur.motDePasse = await bcrypt.hash(motDePasse, salt);

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