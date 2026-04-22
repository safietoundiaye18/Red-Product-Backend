const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configurer Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurer le stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'red-product/hotels',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill' }]
  }
});

const upload = multer({ storage });

module.exports = upload;


/*

Explication :

diskStorage → dit à Multer de sauvegarder les fichiers sur le disque dans le dossier uploads/
destination → le dossier de destination
filename → on génère un nom unique avec Date.now() pour éviter que deux images aient le même nom. Par exemple hotel-1714000000000.jpg
filtrerFichiers → on vérifie que le fichier est bien une image. Si quelqu'un envoie un fichier .exe ou .pdf, on le refuse
limits: { fileSize: 5MB } → on limite la taille des images à 5MB pour ne pas surcharger le serveur


Explication :

cloudinary.config → connecte votre app à Cloudinary avec vos identifiants
CloudinaryStorage → remplace le stockage local par Cloudinary
folder: 'red-product/hotels' → les images seront organisées dans un dossier sur Cloudinary
allowed_formats → seuls ces formats d'images sont acceptés
transformation → Cloudinary redimensionne automatiquement les images à 800x600 pixels pour économiser de l'espace


Voici comment ça fonctionne maintenant :
Avant (local)
Utilisateur envoie image → Multer → dossier uploads/ sur votre machine

Après (Cloudinary)
Utilisateur envoie image → Multer → Cloudinary → URL de l'image

Concrètement :
Quand quelqu'un crée un hôtel avec une image :

Multer reçoit l'image
Multer l'envoie directement sur Cloudinary
Cloudinary sauvegarde l'image dans le dossier red-product/hotels
Cloudinary retourne une URL comme :

https://res.cloudinary.com/votre-cloud-name/image/upload/red-product/hotels/hotel-123.jpg

On sauvegarde cette URL dans MongoDB à la place de /uploads/hotel-123.jpg


Les avantages :

✅ Les images ne disparaissent pas lors du déploiement
✅ Les images sont accessibles depuis n'importe où dans le monde
✅ Cloudinary optimise automatiquement les images
✅ Gratuit jusqu'à 25GB de stockage


Récapitulatif Cloudinary ✅ terminé !

✅ Compte Cloudinary créé
✅ Configuration dans .env
✅ Middleware upload mis à jour
✅ Images stockées sur Cloudinary
*/