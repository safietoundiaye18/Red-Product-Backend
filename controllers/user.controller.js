const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Obtenir le profil
exports.obtenirProfil = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ succes: true, user });
    } catch (erreur) {
        res.status(500).json({ succes: false, message: erreur.message });
    }
};

// Modifier le profil
exports.modifierProfil = async (req, res) => {
    try {
        const { nom, email } = req.body;
        const avatar = req.file ? req.file.path : undefined;

        const donneesAMettreAJour = { nom, email };
        if (avatar) donneesAMettreAJour.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            donneesAMettreAJour,
            { new: true, runValidators: true }
        );

        res.status(200).json({ succes: true, user });
    } catch (erreur) {
        res.status(500).json({ succes: false, message: erreur.message });
    }
};

// Modifier le mot de passe
exports.modifierMotDePasse = async (req, res) => {
    try {
        const { ancienMotDePasse, nouveauMotDePasse } = req.body;

        const user = await User.findById(req.user.id).select('+motDePasse');

        const correct = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
        if (!correct) {
            return res.status(401).json({
                succes: false,
                message: 'Ancien mot de passe incorrect'
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.motDePasse = await bcrypt.hash(nouveauMotDePasse, salt);
        await user.save();

        res.status(200).json({
            succes: true,
            message: 'Mot de passe modifié avec succès'
        });
    } catch (erreur) {
        res.status(500).json({ succes: false, message: erreur.message });
    }
};