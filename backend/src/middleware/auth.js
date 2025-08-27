const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);
    req.user = {
        userId: decodedToken.userId,
        isAdmin: decodedToken.isAdmin || false
    };
    next();
  } catch(error) {
      //res.status(401).json({ error });
      res.status(401).json({ message: 'Unauthorized access !' });
  }
};

module.exports = authenticateToken;
