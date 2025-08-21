const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const responseHelpers = require('./middleware/responseHelpers');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

// CORS
app.use(cors());

// Response helpers middleware
app.use(responseHelpers);
/*
const cors = require('cors');
const app = express();
const allowedOrigins = ['https://my-frontend.com'];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
*/

//Routes pour l'objet Seasons
const seasonsRoutes = require('./routes/seasons');
app.use('/api/seasons', seasonsRoutes);

//Routes pour l'objet Games
const gamesRoutes = require('./routes/games');
app.use('/api/games', gamesRoutes);

//Routes pour l'objet Members
const membersRoutes = require('./routes/members');
app.use('/api/members', membersRoutes);

//Routes pour l'objet Memberships
const membershipsRoutes = require('./routes/memberships');
app.use('/api/memberships', membershipsRoutes);

//Routes pour l'objet Borrowings
const borrowingsRoutes = require('./routes/borrowings');
app.use('/api/borrowings', borrowingsRoutes);

//Routes pour l'authentification
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

//Route pour le dossier images
const path = require('path');
app.use('/images', express.static('/app/images'));

// Route de test
app.get('/', (req, res) => {
  res.send('Hello World from BCM !!!');
});








// 404 handler
app.use((req, res) => {
    res.notFound('Route non trouvée');
});

// Error handling middleware (must be last)
app.use(errorHandler);
 
module.exports = app;