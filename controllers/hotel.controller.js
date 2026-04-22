const Hotel = require('../models/Hotel');

// Récupérer tous les hôtels
exports.obtenirHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ actif: true });
    res.status(200).json({
      succes: true,
      nombre: hotels.length,
      hotels
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Récupérer un hôtel par son ID
exports.obtenirHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        succes: false,
        message: 'Hôtel introuvable'
      });
    }
    res.status(200).json({
      succes: true,
      hotel
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Créer un hôtel
exports.creerHotel = async (req, res) => {
  try {
    const { nom, adresse, email, telephone, prixParNuit, devise } = req.body;

    // Récupérer l'image si elle existe
    const image = req.file ? req.file.path : null;

    const hotel = new Hotel({
      nom,
      adresse,
      email,
      telephone,
      prixParNuit,
      devise,
      image,
      creePar: req.user.id
    });

    await hotel.save();

    res.status(201).json({
      succes: true,
      hotel
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Modifier un hôtel
exports.modifierHotel = async (req, res) => {
  try {
    const { nom, adresse, email, prixParNuit, telephone, devise } = req.body;

    // Récupérer la nouvelle image si elle existe
   const image = req.file ? req.file.path : undefined;

    const donneesAMettreAJour = {
      nom,
      adresse,
      email,
      telephone,
      prixParNuit,
      devise
    };

    // Ajouter l'image seulement si une nouvelle a été uploadée
    if (image) donneesAMettreAJour.image = image;

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      donneesAMettreAJour,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        succes: false,
        message: 'Hôtel introuvable'
      });
    }

    res.status(200).json({
      succes: true,
      hotel
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};

// Supprimer un hôtel
exports.supprimerHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        succes: false,
        message: 'Hôtel introuvable'
      });
    }

    res.status(200).json({
      succes: true,
      message: 'Hôtel supprimé avec succès'
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};


/*

Explication des nouveaux éléments :

Hotel.find({ actif: true }) → récupère seulement les hôtels actifs
req.params.id → récupère l'ID dans l'URL, par exemple dans /api/hotels/123, req.params.id vaut 123
req.file → contient l'image uploadée par Multer. Si pas d'image, il est null
req.user.id → l'ID de l'utilisateur connecté, ajouté par le middleware proteger
findByIdAndUpdate → trouve et met à jour en une seule opération
{ new: true } → retourne le document après modification, pas avant
runValidators: true → vérifie les règles du modèle même lors d'une modification
findByIdAndDelete → trouve et supprime en une seule opération

const image = req.file ? req.file.path : undefined;
*/