const apiKey = process.env.API_KEY; // Définissez votre clé API ici ou utilisez une variable d'environnement

const authenticateApiKey = (req, res, next) => {
    const providedApiKey = req.headers['x-api-key'];
    if (!providedApiKey || providedApiKey !== apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next(); // L'API Key est valide, passer à la suite
};

module.exports = authenticateApiKey;
