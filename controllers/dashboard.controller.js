const User = require('../models/User');
const Hotel = require('../models/Hotel');

exports.obtenirKPIs = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const hotels = await Hotel.countDocuments();

    res.status(200).json({
      succes: true,
      kpis: {
        users,
        hotels,
        messages: 0,
        emails: 0,
        entites: 0,
        formulaires: 0
      }
    });
  } catch (erreur) {
    res.status(500).json({
      succes: false,
      message: erreur.message
    });
  }
};