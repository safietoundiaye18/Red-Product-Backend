const mongoose = require('mongoose');

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


/* Explication ligne par ligne :

require('mongoose') → on importe Mongoose, notre traducteur entre JS et MongoDB
async/await → la connexion prend du temps, async/await permet d'attendre que ce soit terminé avant de continuer
try/catch → on essaie de se connecter (try), si ça échoue on attrape l'erreur (catch)
connexion.connection.host → affiche l'adresse du serveur MongoDB dans le terminal pour confirmer que ça marche
process.exit(1) → si la connexion échoue, on arrête tout le serveur. Inutile de continuer sans base de données
module.exports → on exporte cette fonction pour pouvoir l'utiliser dans server.js  */