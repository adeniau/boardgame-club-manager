const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authenticateApiKey = require('../middleware/auth_api');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST
router.post('/login/', authenticateApiKey, async (req, res) => {
  let login = req.body;
  try {
        const result = await db.pool.query("select id,admin_password,admin from members where admin=1 and email=?", [login.email]);
        //Unauthorized login
        if (result.length == 0) {
            return res.status(401).json({ message: 'Unauthorized login !' });
        }
        else {
            //test password
            bcrypt.compare(login.password, result[0].admin_password)
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ message: 'Wrong login/password !' });
                   }
                   res.status(200).json({
                       userId: result[0].id,
                       token: jwt.sign(
                        { userId: result[0].id },
                        process.env.RANDOM_TOKEN_SECRET,
                        { expiresIn: '24h' }
                    )
                   });
               })
               .catch(error => res.status(500).json({ error }));
        }
//        res.send(result);
  } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
  }
});



module.exports = router;