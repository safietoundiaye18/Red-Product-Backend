const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;

/*

Explication :

nodemailer.createTransport → crée une connexion avec le serveur email (Gmail)
host → l'adresse du serveur Gmail smtp.gmail.com
port → le port de communication avec Gmail 587
auth → vos identifiants Gmail pour s'authentifier
module.exports → on exporte le transporteur pour l'utiliser dans le controller



1. Installation
bashnpm install nodemailer

2. Configuration Gmail
On a généré un mot de passe d'application sur Google car Gmail n'accepte pas votre mot de passe normal pour les applications tierces.

Allez sur https://myaccount.google.com/apppasswords
Créez un mot de passe pour "RED PRODUCT"
Google génère un mot de passe de 16 caractères


3. Fichier .env
On a ajouté les variables secrètes :
dotenvEMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=safietoundiaye18@gmail.com
EMAIL_PASS=votremotdepasse16caracteres
EMAIL_FROM=RED PRODUCT <safietoundiaye18@gmail.com>

4. Fichier config/email.js
On a créé le transporteur nodemailer :
jsconst nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = transporter;

5. Utilisation dans auth.controller.js
On a importé le transporteur et envoyé l'email :
jsconst transporter = require('../config/email');

await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: utilisateur.email,
  subject: 'Réinitialisation de votre mot de passe',
  html: `
    <h2>Bonjour ${utilisateur.nom}</h2>
    <a href="${lien}">Réinitialiser mon mot de passe</a>
    <p>Ce lien expire dans 10 minutes.</p>
  `
});

En résumé :
ÉlémentRôlenodemailerLa bibliothèque qui envoie les emailssmtp.gmail.comLe serveur Gmail qui envoiemot de passe applicationClé spéciale pour autoriser votre apptransporterLa connexion configurée avec GmailsendMailLa fonction qui envoie l'email

C'est clair ? On passe à la Tâche 7 : Dashboard KPI ? 🚀Vous avez dit : EMAIL_HOST=smtp.EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=safietoundiaye18@gmail.com
EMAIL_PASS=votremotdepasse16caracteres
EMAIL_FROM=RED PRODUCT <safietoundiaye18@gmail.com> ou tu as pris ça et c'est quoi son  utilité15:59Claude a répondu : Bonne question !Bonne question ! 😊

D'où vient cette configuration ?
C'est la configuration standard de Gmail SMTP. SMTP c'est le protocole universel d'envoi d'emails. Tous les services email (Gmail, Outlook, Yahoo) utilisent SMTP.
Ces informations viennent de la documentation officielle de Gmail :

smtp.gmail.com → c'est l'adresse du serveur d'envoi de Gmail, c'est public et connu
587 → c'est le port standard pour envoyer des emails de façon sécurisée


L'utilité de chaque ligne :
EMAIL_HOST=smtp.gmail.com
C'est l'adresse du facteur. Quand vous envoyez une lettre, vous la déposez à La Poste. Ici vous déposez votre email chez Gmail via cette adresse.
EMAIL_PORT=587
C'est la porte d'entrée du bureau de poste. Le bureau a plusieurs portes, la porte 587 est celle réservée aux envois sécurisés.
EMAIL_USER=safietoundiaye18@gmail.com
C'est votre identité. Comme quand vous montrez votre carte d'identité au bureau de poste pour envoyer un colis.
EMAIL_PASS=votremotdepasse16caracteres
C'est votre clé secrète. Ce n'est pas votre vrai mot de passe Gmail mais un mot de passe spécial que Google génère pour les applications tierces. C'est pour la sécurité, si quelqu'un vole ce mot de passe il ne peut pas accéder à votre compte Gmail.
EMAIL_FROM=RED PRODUCT <safietoundiaye18@gmail.com>
C'est le nom qui apparaît dans la boîte mail du destinataire. Quand vous recevez l'email, vous voyez "RED PRODUCT" comme expéditeur au lieu de juste l'adresse email. C'est plus professionnel.

En résumé :
Sans ces informations, nodemailer ne sait pas :

Où envoyer l'email (HOST)
Par quelle porte entrer (PORT)
Qui vous êtes (USER)
Votre clé d'accès (PASS)
Quel nom afficher (FROM)

*/