const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifier que le token JWT est valide
exports.proteger = async (req, res, next) => {
  let token;

  // Vérifier si le token est dans le header
  if (req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Si pas de token
  if (!token) {
    return res.status(401).json({
      succes: false,
      message: 'Accès non autorisé. Veuillez vous connecter.'
    });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    req.user = await User.findById(decoded.id);

    next();
  } catch (erreur) {
    return res.status(401).json({
      succes: false,
      message: 'Token invalide ou expiré.'
    });
  }
};

// Restreindre l'accès selon le rôle
exports.autoriser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        succes: false,
        message: `Le rôle "${req.user.role}" n'a pas accès à cette ressource.`
      });
    }
    next();
  };
};

/*
French greetingBojour11:45Bonjour ! Comment puis-je vous aider aujourd'hui ? 😊je suis sur un projet que je dois faire avec du html, CSS , js et du nodejs pour le backend, j'ai déja fait la page connexion, mot de passe oublier et page d'inscription, page liste des hôtels et la page daschboard. voici les capture  de ce que j'ai fait11:51Bravo pour le travail accompli ! Votre interface est propre et bien structurée. Voici un aperçu récapitulatif de ce que vous avez réalisé et quelques suggestions pour la suite.
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
VvisualizeVvisualize show_widgetTrès bon travail ! Votre projet RED PRODUCT est bien avancé. Voici quelques observations sur ce que j'ai pu voir :
Ce qui est bien fait :

Le design est cohérent sur toutes les pages (sidebar sombre, typographie claire)
Les pages d'auth (connexion, inscription, mot de passe oublié) sont propres et fonctionnelles
La liste des hôtels en grille de cartes est bien présentée avec photo, adresse et prix

Quelques améliorations possibles :

Le dashboard pourrait intégrer des graphiques (évolution des réservations, revenus, etc.)
La liste des hôtels gagne à avoir un système de filtres/recherche fonctionnel
Ajouter une pagination sur la liste des hôtels

Sur quoi souhaitez-vous travailler ensuite ? Vous pouvez cliquer sur les cartes ci-dessus ou me dire directement ce dont vous avez besoin.je veux le la partie backend avec nodeJS11:53Pour bien structurer le backend, j'ai quelques questions :Q : Quelle base de données voulez-vous utiliser ?
R : MongoDBQ : Quelles fonctionnalités backend souhaitez-vous ? (Sélectionnez toutes les réponses applicables)
R : Auth JWT (login/register), Upload d'images, CRUD Hôtels, Gestion utilisateursQ : Avez-vous déjà initialisé un projet Node.js ?
R : Non, partir de zéro11:54Parfait ! Je vais vous créer un backend complet. Laissez-moi d'abord lire le skill approprié.Checking available skillsChecking available skillsJe vais créer tous les fichiers du backend. Voici la structure complète :7 fichiers créés7 fichiers créésLa réponse de Claude a été interrompue.Réessayerje veux qu'on le fasse ensemble étape par etape pour que je conprend11:55Bonne idée ! On va avancer ensemble, étape par étape, et je vous expliquerai chaque chose avant de la coder.

Étape 1 : Initialiser le projet
Ouvrez votre terminal dans le dossier de votre projet et exécutez ces commandes une par une :
bashmkdir red-product-backend
cd red-product-backend
npm init -y
npm init -y crée automatiquement un fichier package.json qui est la "carte d'identité" de votre projet Node.js. Il liste le nom du projet, la version, et plus tard toutes les bibliothèques que vous installez.

Étape 2 : Installer les dépendances
bashnpm install express mongoose jsonwebtoken bcryptjs dotenv cors multer
npm install --save-dev nodemon
Voici ce que chaque package fait :
PackageRôleexpressFramework pour créer l'APImongooseConnecter et manipuler MongoDBjsonwebtokenCréer et vérifier les tokens JWT (connexion)bcryptjsChiffrer les mots de passedotenvLire les variables d'environnement (.env)corsAutoriser votre frontend à appeler l'APImulterGérer l'upload d'imagesnodemonRedémarrer le serveur automatiquement en développement

Dites-moi quand c'est fait ✅, et on passera à l'Étape 3 : créer la structure des dossiers et le fichier server.js.c'est fait mais avent de passer explique l'importance de dquon vien de faire13:51Très bonne question ! C'est important de comprendre avant d'avancer.

Ce qu'on vient de faire, c'est poser les fondations du projet.
Imaginez que vous construisez une maison. Avant de poser les murs, vous avez besoin d'un terrain et des matériaux de construction. C'est exactement ce qu'on vient de faire.

npm init -y — La carte d'identité du projet
Ce fichier package.json créé dit à Node.js : "ce dossier est un projet, voilà son nom, sa version, et ce dont il a besoin pour fonctionner". Sans lui, Node.js ne sait pas que votre dossier est un projet, et vous ne pouvez pas installer de packages.

Les packages installés — Les outils de travail
Quand vous faites npm install, Node.js télécharge ces outils dans un dossier appelé node_modules. Vous n'écrivez pas ces outils vous-même, vous les utilisez. C'est comme acheter une perceuse au lieu de la fabriquer.

Express est le plus important : c'est lui qui va recevoir les requêtes de votre frontend (comme "donne-moi la liste des hôtels") et renvoyer une réponse.
Mongoose est le traducteur entre votre code JavaScript et MongoDB. MongoDB ne parle pas JS directement, Mongoose fait le lien.
bcryptjs protège vos utilisateurs. Si quelqu'un vole votre base de données, les mots de passe seront illisibles car chiffrés.
jsonwebtoken (JWT) est comme un badge d'accès. Quand un utilisateur se connecte, on lui donne un token. À chaque requête suivante, il présente ce token pour prouver qui il est, sans retaper son mot de passe.
dotenv protège vos informations sensibles (mot de passe MongoDB, clé secrète JWT). Ces infos ne doivent jamais être écrites directement dans le code, mais dans un fichier .env séparé qu'on ne partage pas.
cors est un mécanisme de sécurité des navigateurs. Par défaut, votre frontend sur localhost:3000 ne peut pas appeler votre API sur localhost:5000. Cors lève cette restriction.
multer gère les fichiers envoyés par formulaire. Sans lui, Express ne sait pas traiter les images.
nodemon est uniquement pour le développement. Normalement, si vous modifiez votre code, vous devez arrêter et relancer le serveur manuellement. Nodemon le fait automatiquement pour vous.


En résumé : on a créé le projet et rassemblé tous les outils nécessaires. Le code qu'on va écrire ensuite n'est que l'utilisation de ces outils.

Prêt pour l'Étape 3 ? On va créer la structure des dossiers et le fichier server.js qui est le cœur de votre application. ✅donc si on me demande d'expliquer ce que je vien de faire je pourrais dire , j'ai créer le dossier Backend et intaller les dépendence13:56Oui, c'est exactement ça ! Mais vous pouvez aller un peu plus loin dans l'explication pour montrer que vous comprenez vraiment. Par exemple :

"J'ai initialisé le projet Node.js avec npm init ce qui a créé le fichier package.json, qui est la carte d'identité du projet. Ensuite j'ai installé les dépendances nécessaires : Express pour créer l'API, Mongoose pour communiquer avec MongoDB, bcryptjs pour sécuriser les mots de passe, JWT pour gérer l'authentification, Multer pour les uploads d'images, dotenv pour protéger les informations sensibles, et cors pour autoriser mon frontend à appeler l'API."

Cette version montre que vous ne faites pas juste des commandes, vous savez pourquoi vous les faites. Et c'est ça qui fait la différence dans un projet ou lors d'une présentation.
Prêt pour l'étape 3 ? 🚀cors est un mécanisme de sécurité des navigateurs. Par défaut, votre frontend sur localhost:3000 ne peut pas appeler votre API sur localhost:5000. Cors lève cette restriction.multer gère les fichiers envoyés par formulaire. Sans lui, Express ne sait pas traiter les images.   j'ai pas trop compris ces deux14:03Pas de souci, je vais vous expliquer différemment avec des exemples concrets.

CORS — La politique du "domaine étranger"
Imaginez un agent de sécurité à l'entrée d'un immeuble. Par défaut, il laisse entrer seulement les personnes qui viennent du même immeuble. Si quelqu'un vient d'un autre bâtiment, il est bloqué.
C'est exactement ce que fait le navigateur :

Votre frontend tourne sur localhost:**3000** → c'est le bâtiment A
Votre API tourne sur localhost:**5000** → c'est le bâtiment B

Quand votre frontend essaie d'appeler l'API, le navigateur dit "Stop ! tu viens d'un autre port, je bloque". Et vous verrez cette erreur dans la console :
Access to fetch at 'localhost:5000' from origin 'localhost:3000' has been blocked by CORS policy
En installant cors dans Express, vous dites à l'agent de sécurité : "laisse passer tout le monde". Le frontend peut alors appeler l'API sans problème.

Multer — Le facteur qui ouvre les colis
Quand votre frontend envoie un formulaire avec du texte (nom, email...), Express le reçoit et comprend directement. C'est comme recevoir une lettre : vous l'ouvrez et lisez.
Mais quand vous envoyez une image, c'est comme recevoir un colis : il faut un outil spécial pour l'ouvrir, vérifier le contenu, et le ranger au bon endroit.
Multer est ce facteur. Il :

Reçoit l'image envoyée depuis le formulaire
Vérifie que c'est bien une image (pas un virus)
La sauvegarde dans un dossier /uploads sur votre serveur
Donne à Express le nom du fichier sauvegardé pour qu'on puisse l'enregistrer en base de données

Sans Multer, Express reçoit le colis mais ne sait pas quoi en faire. Il l'ignore.

C'est plus clair maintenant ? 😊Express est le plus important : c'est lui qui va recevoir les requêtes de votre frontend (comme "donne-moi la liste des hôtels") et renvoyer une réponse.Mongoose est le traducteur entre votre code JavaScript et MongoDB. MongoDB ne parle pas JS directement, Mongoose fait le lien.bcryptjs protège vos utilisateurs. Si quelqu'un vole votre base de données, les mots de passe seront illisibles car chiffrés.jsonwebtoken (JWT) est comme un badge d'accès. Quand un utilisateur se connecte, on lui donne un token. À chaque requête suivante, il présente ce token pour prouver qui il est, sans retaper son mot de passe.dotenv protège vos informations sensibles (mot de passe MongoDB, clé secrète JWT). Ces infos ne doivent jamais être écrites directement dans le code, mais dans un fichier .env séparé qu'on ne partage pas.nodemon est uniquement pour le développement. Normalement, si vous modifiez votre code, vous devez arrêter et relancer le serveur manuellement. Nodemon le fait automatiquement pour vous. explique comme ça pour les autresAfficher plus14:07Bien sûr !

Express — Le réceptionniste de l'hôtel
Imaginez un hôtel avec un réceptionniste. Quand un client arrive et dit "je veux une chambre", le réceptionniste reçoit la demande, va chercher l'information, et revient avec une réponse.
Express joue ce rôle. Quand votre frontend dit "donne-moi la liste des hôtels", Express reçoit cette demande, va chercher les données dans MongoDB, et renvoie la réponse au frontend. Sans Express, personne ne gère les demandes qui arrivent.

Mongoose — Le traducteur
MongoDB stocke les données dans un format qui ressemble à du JSON, mais il ne comprend pas directement le JavaScript que vous écrivez. C'est comme si vous parliez Wolof et votre base de données parlait Anglais.
Mongoose est l'interprète entre les deux. Vous écrivez en JavaScript, Mongoose traduit et parle à MongoDB dans son langage. Il vous permet aussi de définir la forme de vos données, par exemple : "un hôtel doit toujours avoir un nom, une adresse et un prix".

bcryptjs — Le coffre-fort
Imaginez que vous notez les mots de passe de vos utilisateurs sur un cahier. Si quelqu'un vole ce cahier, il a accès à tous les comptes. C'est catastrophique.
bcryptjs transforme le mot de passe en une suite de caractères illisibles avant de le sauvegarder. Par exemple monMotDePasse123 devient $2a$12$xK9Lm.... Même si quelqu'un vole la base de données, il ne peut rien lire. Et la magie c'est que bcryptjs peut quand même vérifier si le mot de passe saisi est correct, sans jamais déchiffrer l'original.

JWT — Le badge d'accès
Imaginez que vous entrez dans un immeuble sécurisé. La première fois, vous montrez votre carte d'identité à l'accueil et on vous donne un badge. Ensuite, à chaque porte, vous présentez juste le badge, sans ressortir votre carte d'identité.
C'est exactement JWT. L'utilisateur se connecte une fois avec email et mot de passe, le serveur lui donne un token (le badge). Pour chaque requête suivante, le frontend envoie ce token. Le serveur vérifie le badge et autorise l'accès. Le token a une durée de vie, après quoi il faut se reconnecter.

dotenv — Le carnet secret
Dans votre code, vous avez des informations très sensibles : l'adresse de votre base de données, la clé secrète pour créer les tokens JWT, etc. Si vous les écrivez directement dans le code et que vous partagez le projet sur GitHub par exemple, tout le monde les voit. C'est comme afficher votre mot de passe sur un mur public.
dotenv vous permet de mettre ces informations dans un fichier séparé appelé .env. Ce fichier ne se partage jamais, il reste uniquement sur votre machine. Dans votre code vous écrivez juste process.env.MON_SECRET et dotenv va chercher la valeur dans le fichier caché.

nodemon — L'assistant automatique
Quand vous développez et que vous modifiez votre code, le serveur Node.js doit être relancé pour prendre en compte les changements. Sans nodemon, vous devez faire Ctrl+C puis node server.js à chaque modification. C'est très répétitif.
nodemon surveille vos fichiers en permanence. Dès qu'il détecte une modification, il relance le serveur automatiquement. C'est un gain de temps énorme pendant le développement. On ne l'utilise pas en production car en production le code ne change pas constamment.

Maintenant vous avez une compréhension solide de chaque outil 💪. On peut passer à l'étape 3 ?oui on peut avancer14:20Parfait ! 🚀

Étape 3 : Créer la structure des dossiers
Dans votre dossier red-product-backend, créez cette structure. Vous pouvez le faire manuellement ou avec ces commandes dans le terminal :
bashmkdir config models middleware routes controllers uploads
touch server.js .env
Votre projet doit ressembler à ceci :
red-product-backend/
│
├── config/
│   └── db.js            → connexion à MongoDB
│
├── models/
│   ├── User.js          → structure d'un utilisateur
│   └── Hotel.js         → structure d'un hôtel
│
├── middleware/
│   └── auth.js          → vérification du token JWT
│
├── routes/
│   ├── auth.routes.js   → /api/auth
│   ├── hotel.routes.js  → /api/hotels
│   └── user.routes.js   → /api/users
│
├── controllers/
│   ├── auth.controller.js
│   ├── hotel.controller.js
│   └── user.controller.js
│
├── uploads/             → images uploadées
├── .env                 → variables secrètes
└── server.js            → point d'entrée

Pourquoi cette structure ?
Chaque dossier a un rôle précis :

config → tout ce qui concerne la configuration (connexion DB)
models → la forme de vos données (un hôtel a un nom, un prix...)
middleware → des fonctions qui s'exécutent entre la requête et la réponse (vérifier le token)
routes → définit les URLs disponibles (/api/hotels, /api/auth...)
controllers → contient la logique métier (ce qui se passe quand on appelle une route)

Pensez-y comme ça : la route est la porte d'entrée, le controller est la pièce derrière la porte, et le model est le meuble où on range les données.

Dites-moi quand les dossiers sont créés ✅, on passera au fichier .env et à la connexion MongoDB.réexplique encore et explique l'utilité de chaque sous dossier ou fichier14:53Bien sûr ! Prenons le temps de bien comprendre.

La structure, c'est comme un bureau bien organisé
Imaginez que vous travaillez dans un bureau. Si vous mettez tous vos documents en vrac sur la table, vous allez vous perdre. Alors vous utilisez des tiroirs et des classeurs, chacun avec un rôle précis. C'est exactement ce que fait cette structure de dossiers.

server.js — La porte d'entrée
C'est le premier fichier que Node.js exécute quand vous lancez le serveur. C'est lui qui :

démarre Express
connecte MongoDB
dit à Express quelles routes existent

C'est le chef d'orchestre. Il ne fait pas grand chose lui-même, mais il appelle tout le monde.

.env — Le carnet secret
On en a déjà parlé. C'est ici que vous mettez vos informations sensibles que personne ne doit voir :
PORT=5000
MONGODB_URI=mongodb://localhost:27017/red_product
JWT_SECRET=mon_secret_ultra_secret
Ce fichier ne se partage jamais sur GitHub.

Dossier config/
C'est le dossier de configuration. Pour l'instant il contiendra un seul fichier :

db.js → contient le code qui connecte votre application à MongoDB. On l'isole ici pour ne pas encombrer server.js. Si demain vous changez de base de données, vous modifiez juste ce fichier.


Dossier models/
C'est ici que vous définissez la forme de vos données. Avant de sauvegarder quelque chose dans MongoDB, vous devez dire exactement à quoi ça ressemble.

User.js → définit ce qu'est un utilisateur : il a un nom, un email, un mot de passe, un rôle (admin ou user). C'est comme un formulaire vide que chaque utilisateur doit remplir.
Hotel.js → définit ce qu'est un hôtel : il a un nom, une adresse, un prix par nuit, une image, etc.

Sans les models, MongoDB accepterait n'importe quoi. Avec les models, vous avez des règles strictes.

Dossier middleware/
Le middleware c'est une fonction qui se place entre la requête et la réponse. Comme un vigile à l'entrée d'une boîte de nuit : avant de vous laisser entrer, il vérifie votre âge.

auth.js → avant d'accéder à une route protégée (comme "créer un hôtel"), ce fichier vérifie que l'utilisateur a un token JWT valide. Si non, il bloque l'accès et renvoie une erreur. Si oui, il laisse passer.


Dossier routes/
C'est ici que vous définissez toutes les URLs disponibles dans votre API. C'est l'annuaire de votre application.

auth.routes.js → gère les URLs liées à l'authentification :

POST /api/auth/inscription → créer un compte
POST /api/auth/connexion → se connecter
POST /api/auth/mot-de-passe-oublie → réinitialiser le mot de passe


hotel.routes.js → gère les URLs liées aux hôtels :

GET /api/hotels → récupérer tous les hôtels
POST /api/hotels → créer un hôtel
PUT /api/hotels/:id → modifier un hôtel
DELETE /api/hotels/:id → supprimer un hôtel


user.routes.js → gère les URLs liées aux utilisateurs :

GET /api/users → liste des utilisateurs
PUT /api/users/:id → modifier un utilisateur
DELETE /api/users/:id → supprimer un utilisateur




Dossier controllers/
Si les routes sont les portes, les controllers sont les pièces derrière ces portes. C'est ici que se trouve toute la logique : ce qui se passe réellement quand une route est appelée.

auth.controller.js → contient les fonctions : inscription, connexion, mot de passe oublié. C'est ici qu'on vérifie le mot de passe avec bcryptjs et qu'on crée le token JWT.
hotel.controller.js → contient les fonctions : récupérer les hôtels, créer un hôtel, modifier, supprimer. C'est ici qu'on utilise Mongoose pour parler à MongoDB.
user.controller.js → contient les fonctions de gestion des utilisateurs.


Dossier uploads/
C'est simplement le dossier où Multer va sauvegarder les images uploadées. Quand un admin ajoute la photo d'un hôtel, l'image est stockée ici sur le serveur.

En résumé avec un schéma simple :
Requête du frontend
        ↓
    server.js        (reçoit et dirige)
        ↓
    routes/          (quelle URL ?)
        ↓
  middleware/        (token valide ?)
        ↓
  controllers/       (que faire ?)
        ↓
    models/          (quelle forme ?)
        ↓
     MongoDB         (sauvegarder)

C'est maintenant beaucoup plus clair ? 😊 Dites-moi et on commence à écrire le code fichier par fichier !le controller j'ai pas trop compris15:13Bonne question ! Prenons un exemple très concret.

Le controller, c'est le cuisinier d'un restaurant
Imaginez un restaurant :

Le client (frontend) passe une commande au serveur
Le serveur (route) prend la commande et la transmet en cuisine
Le cuisinier (controller) reçoit la commande, prépare le plat, et le renvoie au serveur qui le donne au client

Le cuisinier ne s'occupe pas de recevoir les clients, il s'occupe juste de préparer ce qu'on lui demande.

Exemple concret avec votre projet
Quand votre frontend appelle GET /api/hotels pour avoir la liste des hôtels, voici ce qui se passe :
Frontend demande → /api/hotels
                        ↓
         hotel.routes.js reçoit et dit :
         "ok cette URL, je la confie au controller"
                        ↓
         hotel.controller.js prend le relais et :
         1. Va chercher les hôtels dans MongoDB
         2. Vérifie qu'il n'y a pas d'erreur
         3. Renvoie la liste au frontend

Sans controller, où mettrait-on ce code ?
Vous pourriez tout écrire directement dans la route. Ça donnerait ça :
js// Dans hotel.routes.js — MAUVAISE pratique
router.get('/', async (req, res) => {
  const hotels = await Hotel.find();
  res.json(hotels);
  // ... et si la logique est très longue ?
  // Le fichier devient illisible
});
Avec un controller, vous séparez proprement :
js// hotel.routes.js — juste l'adresse
router.get('/', obtenirHotels);

// hotel.controller.js — la logique
exports.obtenirHotels = async (req, res) => {
  const hotels = await Hotel.find();
  res.json(hotels);
};

Pourquoi c'est important ?
Parce que votre logique peut devenir très complexe. Par exemple, pour créer un hôtel vous devez :

Vérifier que l'utilisateur est admin
Vérifier que tous les champs sont remplis
Vérifier que l'image est valide
Sauvegarder l'image dans uploads/
Sauvegarder l'hôtel dans MongoDB
Renvoyer une réponse

Si vous mettez tout ça dans la route, le fichier devient un cauchemar à lire. Le controller garde tout ça organisé et séparé.

En une phrase simple : la route dit QUOI faire, le controller dit COMMENT le faire. 😊
C'est plus clair maintenant ? On peut commencer à coder ?red-product-backend/
│
├── config/
│   └── db.js            → connexion à MongoDB
│
├── models/
│   ├── User.js          → structure d'un utilisateur
│   └── Hotel.js         → structure d'un hôtel
│
├── middleware/
│   └── auth.js          → vérification du token JWT
│
├── routes/
│   ├── auth.routes.js   → /api/auth
│   ├── hotel.routes.js  → /api/hotels
│   └── user.routes.js   → /api/users
│
├── controllers/
│   ├── auth.controller.js
│   ├── hotel.controller.js
│   └── user.controller.js
│
├── uploads/             → images uploadées
├── .env                 → variables secrètes
└── server.js            → point d'entrée                   tu n'as pas fait explication sur controller comme les autresAfficher plus15:20Vous avez raison, voici la même logique appliquée au controller :

controllers/auth.controller.js → C'est le cuisinier responsable de tout ce qui concerne l'authentification. Quand quelqu'un veut s'inscrire, c'est lui qui vérifie que l'email n'existe pas déjà, chiffre le mot de passe avec bcryptjs, sauvegarde l'utilisateur dans MongoDB et renvoie un token JWT.
controllers/hotel.controller.js → C'est le cuisinier responsable de tout ce qui concerne les hôtels. Récupérer la liste des hôtels, créer un nouvel hôtel, modifier les infos d'un hôtel, supprimer un hôtel, sauvegarder l'image avec Multer. Toute la logique autour des hôtels est ici.
controllers/user.controller.js → C'est le cuisinier responsable de tout ce qui concerne les utilisateurs. Récupérer la liste des utilisateurs, modifier le profil d'un utilisateur, changer son rôle (admin ou user), supprimer un compte.

En résumé pour toute la structure :

server.js → le chef d'orchestre, il démarre tout
.env → le carnet secret, les infos sensibles
config/db.js → le technicien qui branche MongoDB
models/ → les formulaires vides qui définissent la forme des données
middleware/auth.js → le vigile qui vérifie le badge JWT
routes/ → l'annuaire des URLs disponibles
controllers/ → les cuisiniers qui traitent chaque demande
uploads/ → le dossier de stockage des images


Maintenant vous avez une vision complète et claire de chaque fichier 💪. On commence à coder ? On va commencer par le plus logique : .env puis config/db.js pour connecter MongoDB en premier.c'est fait j'ai créer la structure15:24Parfait ! La structure est exactement comme prévu 👍.
Je vois que vous avez aussi déjà server.js, package.json et .env créés. C'est bien.

Étape 4 : Remplir le fichier .env
Ouvrez le fichier .env et collez ceci dedans :
PORT=5000
MONGODB_URI=mongodb://localhost:27017/red_product
JWT_SECRET=red_product_secret_jwt_2024
JWT_EXPIRE=7d
Explication de chaque ligne :

PORT=5000 → le numéro de port sur lequel votre serveur va écouter. C'est comme le numéro de bureau dans un immeuble.
MONGODB_URI → l'adresse de votre base de données MongoDB sur votre machine locale. red_product c'est le nom de la base qui sera créée automatiquement.
JWT_SECRET → la clé secrète utilisée pour signer les tokens JWT. Plus elle est longue et complexe, plus c'est sécurisé.
JWT_EXPIRE=7d → le token expire après 7 jours. Après ça, l'utilisateur devra se reconnecter.


Dites-moi quand c'est fait ✅, on passera à config/db.js pour connecter MongoDB.c'est fait15:27Parfait ! 🚀

Étape 5 : Créer config/db.js — La connexion à MongoDB
Ouvrez le fichier db.js dans le dossier config/ et collez ceci :
jsconst mongoose = require('mongoose');

const connecterDB = async () => {
  try {
    const connexion = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connecté : ${connexion.connection.host}`);
  } catch (erreur) {
    console.error(`Erreur de connexion : ${erreur.message}`);
    process.exit(1);
  }
};

module.exports = connecterDB;

Explication ligne par ligne :

require('mongoose') → on importe Mongoose, notre traducteur entre JS et MongoDB
async/await → la connexion prend du temps, async/await permet d'attendre que ce soit terminé avant de continuer
try/catch → on essaie de se connecter (try), si ça échoue on attrape l'erreur (catch)
connexion.connection.host → affiche l'adresse du serveur MongoDB dans le terminal pour confirmer que ça marche
process.exit(1) → si la connexion échoue, on arrête tout le serveur. Inutile de continuer sans base de données
module.exports → on exporte cette fonction pour pouvoir l'utiliser dans server.js


Dites-moi quand c'est fait ✅, on passera à server.js qui va utiliser cette connexion.c'est fait15:35Parfait ! 🚀

Étape 6 : Créer server.js — Le chef d'orchestre
Ouvrez le fichier server.js à la racine et collez ceci :
jsconst express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connecterDB = require('./config/db');

const app = express();

// Connexion à MongoDB
connecterDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre le dossier uploads accessible publiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API RED PRODUCT en ligne ✅' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

Explication ligne par ligne :

require('dotenv').config() → charge les variables de votre fichier .env en premier, avant tout le reste
connecterDB() → appelle la fonction qu'on vient de créer dans config/db.js pour connecter MongoDB
app.use(cors()) → autorise le frontend à appeler l'API
app.use(express.json()) → permet à Express de lire les données JSON envoyées par le frontend
app.use(express.urlencoded()) → permet de lire les données envoyées depuis un formulaire HTML
app.use('/uploads', express.static(...)) → rend les images du dossier uploads/ accessibles via une URL comme localhost:5000/uploads/monimage.jpg
app.get('/') → une route de test pour vérifier que le serveur fonctionne
app.listen(PORT) → démarre le serveur et écoute sur le port 5000


Quand c'est fait, on va tester que tout fonctionne avec cette commande :
bashnpm run dev
Vous devriez voir dans le terminal :
Serveur démarré sur le port 5000
MongoDB connecté : localhost
Dites-moi ce que vous voyez dans le terminal ✅npm run dev
npm error Missing script: "dev"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\USER\AppData\Local\npm-cache\_logs\2026-04-19T15_38_41_213Z-debug-0.log15:39Pas de souci ! C'est parce que le fichier package.json n'a pas encore le script dev. Ouvrez le fichier package.json et vérifiez qu'il ressemble à ceci :
json{
  "name": "red-product-backend",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
La partie importante c'est :
json"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
}
Explication :

start → lance le serveur en mode production avec node
dev → lance le serveur en mode développement avec nodemon qui redémarre automatiquement

Sauvegardez et relancez :
bashnpm run dev
Dites-moi ce que vous voyez dans le terminal ✅npm run dev
> red-product-backend@1.0.0 dev
> nodemon server.js
[nodemon] 3.1.14
[nodemon] to restart at any time, enter rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node server.js
◇ injected env (4) from .env // tip: ⌘ enable debugging { debug: true }
Serveur démarré sur le port 500015:42Presque parfait ! 🎉 Le serveur démarre bien sur le port 5000 et nodemon fonctionne.
Mais vous remarquez qu'il manque le message "MongoDB connecté". Cela veut dire que la connexion à MongoDB n'est pas encore établie.

La raison : MongoDB n'est peut-être pas installé ou pas démarré sur votre machine.
Vérifiez en ouvrant un nouveau terminal et tapez :
bashmongod --version
Deux cas possibles :
Cas 1 — vous voyez une version comme db version v7.0.0 → MongoDB est installé mais pas démarré. Tapez :
bashmongod
Cas 2 — vous voyez une erreur comme mongod n'est pas reconnu → MongoDB n'est pas installé. Téléchargez-le ici :
https://www.mongodb.com/try/download/community
Choisissez :

Version : 7.0
OS : Windows
Package : MSI

Installez-le et cochez "Install MongoDB as a Service" pendant l'installation. Cela le démarre automatiquement à chaque démarrage de Windows.

Dites-moi dans quel cas vous êtes ✅Erreur de connexion : connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
[nodemon] app crashed - waiting for file changes before starting...15:43C'est le Cas 2 ! MongoDB n'est pas démarré. Voici comment régler ça rapidement.

Solution la plus simple : utiliser MongoDB Atlas (cloud)
Au lieu d'installer MongoDB sur votre machine, on va utiliser MongoDB Atlas qui est gratuit et hébergé sur internet. Plus simple et vous pourrez accéder à votre base de données de n'importe où.

Étape 1 : Créer un compte
Allez sur :
https://www.mongodb.com/cloud/atlas/register
Créez un compte gratuit avec votre email.

Étape 2 : Créer un cluster gratuit
Une fois connecté :

Cliquez sur "Build a Database"
Choisissez "M0" (gratuit)
Choisissez AWS et la région Paris ou la plus proche
Cliquez "Create"


Étape 3 : Créer un utilisateur

Dans "Security > Database Access", cliquez "Add New Database User"
Mettez un username ex: admin
Mettez un mot de passe ex: admin1234
Cliquez "Add User"


Étape 4 : Autoriser votre adresse IP

Dans "Security > Network Access", cliquez "Add IP Address"
Cliquez "Allow Access From Anywhere"
Cliquez "Confirm"


Étape 5 : Récupérer l'URL de connexion

Allez dans "Database", cliquez "Connect"
Choisissez "Drivers"
Copiez l'URL qui ressemble à :

mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/

Étape 6 : Mettre à jour votre .env
Remplacez la ligne MONGODB_URI par votre URL Atlas :
MONGODB_URI=mongodb+srv://admin:admin1234@cluster0.xxxxx.mongodb.net/red_product
Remplacez admin1234 par votre vrai mot de passe et cluster0.xxxxx par votre vrai cluster.

Sauvegardez et le serveur va redémarrer automatiquement grâce à nodemon. Dites-moi ce que vous voyez dans le terminal ✅j'ai déjas mongodb sur ma machine j'ai même utiliser compasse sur un aute projet15:44Parfait ! Alors MongoDB est installé mais il n'est pas démarré. On va le démarrer.

Ouvrez un nouveau terminal et tapez :
bashnet start MongoDB
Vous devriez voir :
Le service MongoDB a démarré.

Ensuite revenez sur le terminal de votre projet et vous devriez voir automatiquement grâce à nodemon :
Serveur démarré sur le port 5000
MongoDB connecté : localhost

Si vous avez une erreur avec net start MongoDB, essayez :
bashmongod
Dites-moi ce que vous voyez ✅net start MongoDB
Le nom de service n’est pas valide.
Vous obtiendrez une aide supplémentaire en entrant NET HELPMSG 2185.15:47Essayons autrement. Tapez cette commande pour voir le vrai nom du service MongoDB sur votre machine :
bashnet start | findstr -i mongo
Dites-moi exactement ce qui s'affiche ✅2/2net start | findstr -i mongo
qu'est ce que tu essai de faire?15:51Je cherche le nom exact du service MongoDB sur votre machine pour pouvoir le démarrer.
La commande net start liste tous les services Windows qui tournent, et findstr -i mongo filtre pour afficher seulement les lignes qui contiennent le mot "mongo".

Tapez-la et dites-moi ce qu'elle affiche. Si elle n'affiche rien, ça veut dire que MongoDB n'est pas lancé comme service Windows.
Dans ce cas on essaiera directement :
bashmongod --dbpath "C:\data\db"
Mais d'abord dites-moi le résultat de la commande ✅$ mongod --dbpath "C:\data\db"
bash: mongod: command not found15:53D'accord ! mongod n'est pas reconnu car le chemin de MongoDB n'est pas dans les variables d'environnement Windows. On va régler ça.

Étape 1 : Trouver où MongoDB est installé
Ouvrez l'explorateur de fichiers et allez dans :
C:\Program Files\MongoDB\Server\
Vous devriez voir un dossier avec un numéro de version, par exemple 7.0 ou 6.0. Ouvrez-le et allez dans le dossier bin. Vous devriez voir le fichier mongod.exe.

Dites-moi quelle version vous voyez dans ce dossier ✅le voici je l'ai sur ma machine15:55Ah parfait ! Vous avez MongoDB Atlas ! Vous n'avez pas MongoDB installé localement, vous utilisez le cloud. C'est encore mieux !
Je vois votre cluster Cluster0 avec des données déjà dedans.

On va récupérer votre URL de connexion Atlas.
Dans votre navigateur, allez sur :
https://cloud.mongodb.com
Ensuite :

Cliquez sur "Database" dans le menu gauche
Cliquez sur "Connect" à côté de Cluster0
Cliquez sur "Drivers"
Copiez l'URL qui ressemble à :

mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/

Puis ouvrez votre fichier .env et remplacez :
MONGODB_URI=mongodb://localhost:27017/red_product
Par votre URL Atlas en ajoutant red_product à la fin :
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/red_product
Remplacez username et password par vos vrais identifiants.

Dites-moi quand c'est fait ✅drivers  ou compass?15:59Choisissez Drivers
Car on est dans un projet Node.js et on va connecter MongoDB via le code. Drivers donne l'URL pour se connecter depuis le code.
Compass c'est juste pour visualiser vos données graphiquement, comme ce que vous voyez sur votre capture d'écran. Ce n'est pas ce dont on a besoin ici.c'est fait16:01Parfait ! Vous avez copié l'URL ?
Maintenant ouvrez votre fichier .env et remplacez la ligne MONGODB_URI par votre URL Atlas. Ça doit ressembler à :
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/red_product
JWT_SECRET=red_product_secret_jwt_2024
JWT_EXPIRE=7d
N'oubliez pas de :

Remplacer username par votre vrai nom d'utilisateur
Remplacer password par votre vrai mot de passe
Garder /red_product à la fin de l'URL, c'est le nom de votre base de données qui sera créée automatiquement

Sauvegardez et dites-moi ce que vous voyez dans le terminal ✅Sokhna Sophie@DESKTOP-OI64FEO MINGW64 ~/Desktop/FULLSTACK2/red-product-backend (main)
$ npm start
> red-product-backend@1.0.0 start
> node server.js
◇ injected env (4) from .env // tip: ⌁ auth for agents [www.vestauth.com]
Serveur démarré sur le port 5000
Erreur de connexion : bad auth : authentication failed16:03Presque ! L'erreur bad auth : authentication failed veut dire que le username ou le mot de passe dans votre URL est incorrect.

Vérifiez votre URL dans .env
L'URL doit ressembler exactement à ceci :
mongodb+srv://admin:monMotDePasse@cluster0.xxxxx.mongodb.net/red_product
Les erreurs les plus courantes :

Le mot de passe contient des caractères spéciaux comme @, #, ! qui cassent l'URL
Vous avez oublié de remplacer <password> par votre vrai mot de passe
Le nom d'utilisateur est mal écrit


Solution :
Allez sur MongoDB Atlas :

Security > Database Access
Cliquez sur "Edit" à côté de votre utilisateur
Cliquez sur "Edit Password"
Mettez un mot de passe simple sans caractères spéciaux, par exemple : admin1234
Cliquez "Update User"

Puis mettez à jour votre .env avec ce nouveau mot de passe et sauvegardez.
Dites-moi ce que vous voyez dans le terminal ✅<j'ai les chevron avec le mots de passe16:04C'est le problème ! Les chevrons < et > font partie du modèle d'URL, il faut les supprimer.

Dans votre .env, vous avez probablement :
MONGODB_URI=mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/red_product
Il faut remplacer <password> par votre vrai mot de passe sans les chevrons :
MONGODB_URI=mongodb+srv://username:admin1234@cluster0.xxxxx.mongodb.net/red_product
Les < et > sont juste des indicateurs qui disent "mettez votre mot de passe ici", ce ne sont pas des caractères à garder.

Sauvegardez et dites-moi ce que vous voyez dans le terminal ✅c'est fait mais toujour le même problème16:05D'accord, allons vérifier directement sur Atlas.

Étape 1 : Vérifier votre utilisateur
Allez sur cloud.mongodb.com et :

Cliquez sur "Security" dans le menu gauche
Cliquez sur "Database Access"
Dites-moi exactement le username que vous voyez là


Étape 2 : Réinitialiser le mot de passe

Cliquez sur "Edit" à côté de l'utilisateur
Cliquez sur "Edit Password"
Tapez un mot de passe très simple : Test1234
Cliquez "Update User"
Attendez 30 secondes que Atlas applique les changements


Puis mettez à jour .env :
MONGODB_URI=mongodb+srv://VOTRE_USERNAME:Test1234@cluster0.xxxxx.mongodb.net/red_product
Dites-moi le username que vous voyez sur Atlas ✅◇ injected env (4) from .env // tip: ⌘ override existing { override: true }
Serveur démarré sur le port 5000
MongoDB connecté : ac-ihghq82-shard-00-01.ivsbysb.mongodb.net16:08🎉 Félicitations ! MongoDB est connecté !
Vous voyez le message :
Serveur démarré sur le port 5000
MongoDB connecté : ac-ihghq82-shard-00-01.ivsbysb.mongodb.net
Cela veut dire que :

✅ Votre serveur Express tourne sur le port 5000
✅ Votre application est connectée à MongoDB Atlas


Faisons un dernier test pour vérifier que tout fonctionne. Ouvrez votre navigateur et allez sur :
http://localhost:5000
Vous devriez voir :
json{ "message": "API RED PRODUCT en ligne ✅" }
Dites-moi ce que vous voyez ✅ et on passera à l'étape suivante : créer le modèle Userc'est bon16:08Excellent ! 🎉

Récapitulatif de ce qu'on a fait jusqu'ici :

✅ Initialisé le projet Node.js
✅ Installé toutes les dépendances
✅ Créé la structure des dossiers
✅ Configuré le fichier .env
✅ Connecté MongoDB Atlas
✅ Serveur Express qui tourne

Le serveur reçoit et répond aux requêtes, la base de données est connectée. Les fondations sont solides !

Étape 7 : Créer le modèle User
Ouvrez le fichier models/User.js et collez ceci :
jsconst mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

Explication :

mongoose.Schema → définit la structure d'un utilisateur, comme un formulaire avec des règles
type: String → ce champ doit être du texte
required → ce champ est obligatoire, si il manque MongoDB renvoie l'erreur indiquée
unique: true → deux utilisateurs ne peuvent pas avoir le même email
lowercase: true → l'email est automatiquement converti en minuscules
minlength: 6 → le mot de passe doit avoir au moins 6 caractères
select: false → quand on récupère un utilisateur, le mot de passe n'est jamais renvoyé automatiquement. C'est une mesure de sécurité
enum → le rôle ne peut être que admin ou user, rien d'autre
timestamps: true → MongoDB ajoute automatiquement createdAt et updatedAt à chaque document
module.exports → on exporte le modèle pour l'utiliser dans les controllers


Dites-moi quand c'est fait ✅, on passera au modèle Hotelavant de passer ici la fois passé j'avais entrer sur la plateform mongodb créer laba le projet lui donné un nom avant davoir le lien URI et je vois qu'on n'a pas fait tous ça ici?20:06Très bonne observation ! 👍

En fait vous avez déjà fait tout ça lors de votre premier projet. Quand vous avez créé votre compte Atlas, vous avez déjà :

✅ Créé une organisation "Safietou's Org"
✅ Créé un projet "Premier-Essai"
✅ Créé un cluster "Cluster0"
✅ Créé un utilisateur avec un mot de passe
✅ Autorisé les adresses IP

On a réutilisé tout ça ! C'est pour ça qu'on est allé directement chercher l'URL de connexion.

La seule différence avec votre ancien projet c'est le nom de la base de données. Regardez votre .env :
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/red_product
Le mot red_product à la fin, c'est le nom de votre nouvelle base de données. MongoDB Atlas va la créer automatiquement la première fois qu'on sauvegarde une donnée. Vous la verrez apparaître dans Compass à ce moment-là.

Donc vous n'avez rien manqué, on a juste profité de ce que vous aviez déjà configuré. 😊
On continue avec le modèle Hotel ?comment avoir accès à ce base donné red_product20:08Très bonne question ! Vous pouvez y accéder de deux façons :

Option 1 : Via MongoDB Compass (visuel)
Ouvrez MongoDB Compass sur votre machine et vérifiez que l'URL de connexion est la même que celle de votre .env :
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
Cliquez "Connect" et vous verrez toutes vos bases de données dont red_product apparaîtra automatiquement dès qu'on sauvegarde la première donnée.

Option 2 : Via MongoDB Atlas (navigateur)
Allez sur cloud.mongodb.com et :

Cliquez sur "Database"
Cliquez sur "Browse Collections" à côté de Cluster0
Vous verrez red_product apparaître ici aussi dès qu'on insère la première donnée


Pourquoi elle n'apparaît pas encore ?
Parce que MongoDB ne crée pas la base de données tant qu'il n'y a pas de données dedans. C'est normal. Dès qu'on créera notre premier utilisateur via l'API, vous verrez red_product apparaître automatiquement dans Compass et sur Atlas.

On continue avec le modèle Hotel ? 🚀c'est ici?20:10Non, pas ici ! Cette page c'est pour connecter Compass (l'outil visuel), ce n'est pas ce qu'on veut.

Fermez cette fenêtre et faites ceci :

Cliquez sur "Database" dans le menu gauche
Vous verrez votre Cluster0
Cliquez sur le bouton "Browse Collections"

C'est là que vous verrez toutes vos bases de données dont red_product apparaîtra dès qu'on inserera la première donnée.

Mais en réalité vous n'avez pas besoin de faire ça maintenant. La base red_product n'existe pas encore car on n'a pas encore inséré de données. Elle apparaîtra automatiquement quand on créera le premier utilisateur.
On peut continuer à coder et vous la verrez apparaître toute seule. 😊 On continue avec le modèle Hotel ?c'est ici?20:13Oui c'est exactement ici ! 👍
Vous voyez actuellement 3 bases de données :

admin → système MongoDB
local → système MongoDB
test → votre ancien projet

red_product n'apparaît pas encore parce qu'on n'a pas encore inséré de données. C'est normal.
Dès qu'on créera le premier utilisateur via notre API, vous verrez red_product apparaître automatiquement dans cette liste juste en dessous de test.

On continue le code ! On passe au modèle Hotel ? 🚀oui20:16Parfait ! 🚀

Étape 8 : Créer le modèle Hotel
Ouvrez le fichier models/Hotel.js et collez ceci :
jsconst mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de l\'hôtel est requis']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  ville: {
    type: String,
    required: [true, 'La ville est requise']
  },
  prixParNuit: {
    type: Number,
    required: [true, 'Le prix par nuit est requis'],
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  etoiles: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  actif: {
    type: Boolean,
    default: true
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);

Explication des nouveaux éléments :

type: Number → ce champ doit être un nombre, pas du texte
min: 0 → le prix ne peut pas être négatif
min: 1, max: 5 → les étoiles doivent être entre 1 et 5
default: true → par défaut un hôtel est actif quand il est créé
default: null → l'image est optionnelle au départ
type: Boolean → ce champ est soit true soit false
mongoose.Schema.Types.ObjectId → c'est l'identifiant unique MongoDB. Ici on dit que creePar contient l'ID d'un utilisateur
ref: 'User' → ce champ fait référence au modèle User. Mongoose peut donc retrouver les infos de l'utilisateur qui a créé l'hôtel


Dites-moi quand c'est fait ✅, on passera au middleware d'authentificationc'est fait20:41Parfait ! 🚀

Étape 9 : Créer le middleware d'authentification
Ouvrez le fichier middleware/auth.js et collez ceci :
jsconst jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifier que le token JWT est valide
exports.proteger = async (req, res, next) => {
  let token;

  // Vérifier si le token est dans le header
  if (req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Si pas de token
  if (!token) {
    return res.status(401).json({
      succes: false,
      message: 'Accès non autorisé. Veuillez vous connecter.'
    });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    req.user = await User.findById(decoded.id);

    next();
  } catch (erreur) {
    return res.status(401).json({
      succes: false,
      message: 'Token invalide ou expiré.'
    });
  }
};

// Restreindre l'accès selon le rôle
exports.autoriser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        succes: false,
        message: `Le rôle "${req.user.role}" n'a pas accès à cette ressource.`
      });
    }
    next();
  };
};

Explication :

exports.proteger → c'est le vigile. Il s'exécute avant chaque route protégée pour vérifier le token
req.headers.authorization → le frontend envoie le token dans le header de la requête comme ceci : Bearer montoken123
split(' ')[1] → on coupe la chaine "Bearer montoken123" en deux parties et on prend la deuxième partie, c'est à dire juste le token
jwt.verify() → vérifie que le token est valide et non expiré avec votre JWT_SECRET
decoded.id → le token contient l'ID de l'utilisateur, on le récupère pour trouver l'utilisateur dans MongoDB
req.user → on attache l'utilisateur à la requête pour que les controllers puissent l'utiliser
next() → tout est bon, on passe à la suite
exports.autoriser → vérifie le rôle. Par exemple autoriser('admin') bloque les simples users

Frontend envoie : GET /api/hotels
avec header : Authorization: Bearer montoken123
        ↓
middleware proteger vérifie le token
        ↓
token valide → next() → controller s'exécute
token invalide → erreur 401 → accès refusé
*/