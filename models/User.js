const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    default: 'user'
  },
   tokenReinitialisation: {
    type: String,
    default: null
  },
  expirationToken: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

/*
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


Ce qu'on a ajouté :

require('bcryptjs') → on importe bcrypt en haut du fichier
userSchema.pre('save') → cette fonction s'exécute automatiquement juste avant chaque sauvegarde dans MongoDB
this.isModified('motDePasse') → on vérifie si le mot de passe a été modifié. Si non, on ne rechiffre pas inutilement
bcrypt.hash(this.motDePasse, 12) → on chiffre le mot de passe. Le 12 c'est le niveau de sécurité, plus c'est élevé plus c'est sécurisé mais plus c'est lent

Explication des nouveaux champs :

tokenReinitialisation → le token secret temporaire qu'on va envoyer par email
expirationToken → la date d'expiration du token. Après cette date, le lien ne fonctionne plus. On va le mettre à 10 minutes
*/