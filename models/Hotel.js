const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de l\'hôtel est requis']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  email: {
    type: String,
    required: [true, 'La ville est requise']
  },
   telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    min: 0
  },
  prixParNuit: {
    type: Number,
    required: [true, 'Le prix par nuit est requis'],
    min: 0
  },
  devise: {
    type: String,
    default: 'F XOF'
  },
  image: {
    type: String,
    default: null
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

/*
Explication des nouveaux éléments :

type: Number → ce champ doit être un nombre, pas du texte
min: 0 → le prix ne peut pas être négatif
min: 1, max: 5 → les étoiles doivent être entre 1 et 5
default: true → par défaut un hôtel est actif quand il est créé
default: null → l'image est optionnelle au départ
type: Boolean → ce champ est soit true soit false
mongoose.Schema.Types.ObjectId → c'est l'identifiant unique MongoDB. Ici on dit que creePar contient l'ID d'un utilisateur
ref: 'User' → ce champ fait référence au modèle User. Mongoose peut donc retrouver les infos de l'utilisateur qui a créé l'hôtel
*/ 