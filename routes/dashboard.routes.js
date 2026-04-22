const express = require('express');
const router = express.Router();
const { obtenirKPIs } = require('../controllers/dashboard.controller');
const { proteger } = require('../middleware/auth');

router.get('/kpis', proteger, obtenirKPIs);

module.exports = router;


/*

C'est quoi le Dashboard KPI ?
KPI veut dire Key Performance Indicator en anglais, c'est-à-dire les indicateurs clés de performance. Ce sont les chiffres importants qui donnent une vue d'ensemble de votre application.
Regardez votre dashboard que vous avez fait :

125 Formulaires
40 Messages
600 Utilisateurs
25 E-mails
40 Hôtels
02 Entités

Ces chiffres doivent venir de quelque part. C'est notre endpoint /api/dashboard/kpis qui va les fournir.

Comment ça marche ?
Frontend charge le dashboard
        ↓
Appelle GET /api/dashboard/kpis
        ↓
Backend compte les données dans MongoDB
        ↓
Retourne les chiffres
        ↓
Frontend affiche les chiffres sur les cartes

countDocuments()
C'est la fonction Mongoose qui compte le nombre de documents dans une collection. C'est comme demander à MongoDB :

"Combien d'utilisateurs as-tu ?" → User.countDocuments() → 5
"Combien d'hôtels as-tu ?" → Hotel.countDocuments() → 8


Pourquoi messages: 0, emails: 0 ?
Parce qu'on n'a pas encore créé les modèles Message et Email. On met 0 pour l'instant et on mettra à jour ces chiffres plus tard quand ces modèles existeront.

Pourquoi protéger cette route ?
Ces statistiques sont sensibles. Seul un administrateur connecté doit pouvoir voir combien d'utilisateurs et d'hôtels existent. C'est pour ça qu'on utilise le middleware proteger.

*/




// C'est quoi Helmet ?

// Quand votre navigateur communique avec un serveur, il envoie et reçoit des headers HTTP. Ces headers contiennent des informations sur la requête. Par défaut, Express expose trop d'informations dans ces headers, ce qui peut être exploité par des hackers.

// Helmet ajoute automatiquement des headers de sécurité pour protéger votre API.

// Exemple concret :

// Sans Helmet, votre serveur dit à tout le monde :

// X-Powered-By: Express

// Ça dit aux hackers que vous utilisez Express et quelle version. Ils peuvent chercher des failles connues de cette version.

// Avec Helmet, cette information est cachée. Le hacker ne sait pas ce que vous utilisez.

// Ce que Helmet fait concrètement :

// ProtectionRôleCache les infos du serveurLes hackers ne savent pas ce que vous utilisezXSS ProtectionBloque les attaques par injection de codeClickjackingEmpêche votre site d'être mis dans une iframeHTTPS forcéForce les connexions sécurisées

// Est-ce qu'il y a d'autres alternatives ?

// Oui ! Il en existe d'autres :





// cors → qu'on a déjà installé, gère les origines autorisées



// express-rate-limit → limite les requêtes, qu'on va installer



// express-validator → valide les données entrantes



// hpp → protège contre la pollution des paramètres HTTP



// mongoosasanitize → protège contre les injections MongoDB

// Mais Helmet est le plus populaire car il regroupe plusieurs protections en une seule ligne de code :

// js

// app.use(helmet());






// C'est quoi la validation ?
// Quand un utilisateur envoie des données à votre API, vous devez vérifier que ces données sont correctes avant de les sauvegarder dans MongoDB.
// Par exemple pour l'inscription :

// L'email est-il valide ?
// Le mot de passe a-t-il au moins 6 caractères ?
// Le nom n'est-il pas vide ?

// Sans validation, quelqu'un pourrait envoyer n'importe quoi à votre API.

// Joi et Zod sont deux bibliothèques de validation
// Joi est la plus ancienne et la plus utilisée :
// jsconst schema = Joi.object({
//   email: Joi.string().email().required(),
//   motDePasse: Joi.string().min(6).required(),
//   nom: Joi.string().required()
// });
// Zod est plus moderne et très utilisée avec TypeScript :
// jsconst schema = z.object({
//   email: z.string().email(),
//   motDePasse: z.string().min(6),
//   nom: z.string()
// });

// La différence entre les deux :
// JoiZodPopularitéTrès populaireDe plus en plus populaireLangageJavaScriptJavaScript + TypeScriptSyntaxeChaîne de méthodesPlus moderneTaillePlus lourdPlus léger

// Pour votre projet on va utiliser Joi car :

// C'est ce que la plupart des développeurs utilisent avec Node.js
// Votre coach l'a mentionné en premier
// C'est plus simple à apprendre


// Sans Joi vs Avec Joi :
// Sans Joi on vérifie manuellement :
// jsif (!email) return res.status(400).json({ message: 'Email requis' });
// if (!email.includes('@')) return res.status(400).json({ message: 'Email invalide' });
// if (!motDePasse) return res.status(400).json({ message: 'Mot de passe requis' });
// if (motDePasse.length < 6) return res.status(400).json({ message: 'Mot de passe trop court' });
// Avec Joi c'est beaucoup plus propre :
// jsconst schema = Joi.object({
//   email: Joi.string().email().required().messages({
//     'string.email': 'Email invalide',
//     'any.required': 'Email requis'
//   }),
//   motDePasse: Joi.string().min(6).required().messages({
//     'string.min': 'Mot de passe trop court',
//     'any.required': 'Mot de passe requis'
//   })
// });




// Chacun protège à un niveau différent :
// Helmet → protège les headers HTTP
// C'est comme mettre une armure sur votre serveur. Il cache les informations sensibles sur votre serveur aux hackers.
// express-rate-limit → protège contre les attaques par force brute
// C'est comme un videur qui dit : "Tu as essayé de te connecter 100 fois en 1 minute, je te bloque !"
// Joi → protège contre les mauvaises données
// C'est comme un agent de contrôle qui vérifie que les données envoyées sont correctes avant de les laisser entrer dans votre base de données.

// Analogie avec un bâtiment sécurisé :
// Helmet          → Les murs et le toit du bâtiment
// Rate Limit      → Le vigile à l'entrée
// Joi             → Le scanner de sécurité
// MongoDB         → Le coffre-fort à l'intérieur
// Sans l'un d'eux, votre bâtiment a une faille. Ensemble ils forment une sécurité complète. 😊

// On installe les trois :
// bashnpm install helmet express-rate-limit joi