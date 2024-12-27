const apiKey = process.env.API_KEY;

const validateApiKey = (req, res, next) => {
    const clientApiKey = req.headers['x-api-key'];
    if (clientApiKey && clientApiKey === apiKey) {
        next();
    } else {
        res.status(401).json({ message: 'Invalid API Key' });
    }
};

module.exports = validateApiKey;
