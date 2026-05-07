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

  await resend.emails.send({
    from: 'RED PRODUCT <onboarding@resend.dev>',
    to: utilisateur.email,
    subject: 'Activez votre compte - RED PRODUCT',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background-color: #333333; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">RED PRODUCT</h1>
                <p style="color: #ffd700; margin: 5px 0 0; font-size: 14px;">Gestion d'hôtels</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #333333; margin-top: 0;">Bonjour ${utilisateur.nom} ! 👋</h2>
                
                <p style="color: #666666; line-height: 1.6; font-size: 15px;">
                    Merci de vous être inscrit sur <strong>RED PRODUCT</strong>. 
                    Votre compte a été créé avec succès.
                </p>

                <p style="color: #666666; line-height: 1.6; font-size: 15px;">
                    Pour commencer à utiliser votre compte, veuillez l'activer en cliquant sur le bouton ci-dessous :
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${lien}" 
                       style="background-color: #333333; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block; letter-spacing: 1px;">
                        ✅ Activer mon compte
                    </a>
                </div>

                <!-- Warning -->
                <div style="background-color: #fff8e1; border-left: 4px solid #ffd700; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; color: #666666; font-size: 14px;">
                        ⚠️ Si vous n'avez pas créé de compte sur RED PRODUCT, ignorez cet email. Votre adresse email ne sera pas utilisée.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2026 RED PRODUCT. Tous droits réservés.
                </p>
                <p style="color: #999999; font-size: 12px; margin: 5px 0 0;">
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
            </div>

        </div>

    </body>
    </html>
    `
});

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


exports.activerCompte = async (req, res) => {
  try {
    const { token } = req.params;

    // Chercher l'utilisateur avec ce token
    const utilisateur = await User.findOne({ tokenActivation: token });

    if (!utilisateur) {
      return res.status(400).json({
        succes: false,
        message: 'Token d\'activation invalide ou déjà utilisé'
      });
    }

    // Activer le compte
    utilisateur.estActif = true;
    utilisateur.tokenActivation = null;
    await utilisateur.save();

    // Rediriger vers la page de connexion avec message de succès
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
    const lien = `https://red-product-one.vercel.app/reinitialiser.html?token=${token}`;

    // Envoyer l'email
    // Dans la fonction motDePasseOublie
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