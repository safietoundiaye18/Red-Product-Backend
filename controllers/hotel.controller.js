const Hotel = require('../models/Hotel');

// Récupérer tous les hôtels (seulement ceux de l'utilisateur connecté)
exports.obtenirHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filtres = { 
      actif: true,
      creePar: req.user.id
    };

    if (search) {
      filtres.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { adresse: { $regex: search, $options: 'i' } }
      ];
    }

    const tri = req.query.tri || 'createdAt';
    const ordre = req.query.ordre === 'asc' ? 1 : -1;

    const hotels = await Hotel.find(filtres)
      .sort({ [tri]: ordre })
      .skip(skip)
      .limit(limit);

    const total = await Hotel.countDocuments(filtres);

    res.status(200).json({
      succes: true,
      nombre: hotels.length,
      total,
      page,
      pages: Math.ceil(total / limit),
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
    const image = req.file ? req.file.path : undefined;

    const donneesAMettreAJour = {
      nom, adresse, email, telephone, prixParNuit, devise
    };

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


Explication :

req.query.page → récupère le numéro de page dans l'URL
req.query.limit → récupère le nombre d'hôtels par page
skip → calcule combien d'hôtels sauter. Page 2 avec 10 par page → skip 10
$regex → recherche dans MongoDB comme un LIKE en SQL
$options: 'i' → recherche insensible à la casse (Dakar = dakar = DAKAR)
$or → cherche dans plusieurs champs en même temps
sort() → trie les résultats
skip() → saute les premiers résultats
limit() → limite le nombre de résultats
pages: Math.ceil(total / limit) → calcule le nombre total de pages


Ces endpoints viennent de l'URL que le frontend va envoyer.
Ce sont des query parameters (paramètres de requête). Ils se mettent après le ? dans l'URL.

D'où viennent-ils ?
On les a définis nous-mêmes dans le controller avec req.query :
jsconst page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const search = req.query.search || '';
const tri = req.query.tri || 'createdAt';
const ordre = req.query.ordre === 'asc' ? 1 : -1;

Comment ça marche ?
Quand le frontend appelle :
GET /api/hotels?page=2&limit=5&search=Dakar&tri=prixParNuit&ordre=asc
Express décompose automatiquement l'URL et met dans req.query :
jsreq.query = {
  page: "2",
  limit: "5",
  search: "Dakar",
  tri: "prixParNuit",
  ordre: "asc"
}

En résumé :
ParamètreRôleExemplepageNuméro de page?page=2limitHôtels par page?limit=5searchRecherche par mot?search=DakartriChamp de tri?tri=prixParNuitordreSens du tri?ordre=asc
*/