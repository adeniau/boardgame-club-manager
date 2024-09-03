const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');
const multer = require('../middleware/multer-config');
const fs = require('fs');

// GET
  router.get('/Random/', authenticateApiKey, async (req, res) => {
    try {
        const result = await db.pool.query("select g.id, g.name, g.picture from games g, random_game r where g.id=r.random");
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/', authenticateApiKey, async (req, res) => {
    try {
        const result = await db.pool.query("select * from games order by name");
        res.send(result);
    } catch (err) {
        console.error(' erreur ');
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from games where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/GamesBorrows/:id', authenticateToken, async (req, res) => {
    try {   
        const result = await db.pool.query("select * from games_borrows where id_season=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(' erreur ');
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/GameBorrows/:id', authenticateToken, async (req, res) => {
    try {   
        const result = await db.pool.query("select * from games_borrows where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(' erreur ');
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  // POST
  router.post('/', authenticateToken, multer, async (req, res) => {
    let games = req.body;
    let imageURL = "";
    if (req.file) {
        imageURL=`${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }
    try {
        const result = await db.pool.query("insert into games (name,picture,available) values (?,?,?)", [games.name,imageURL,games.available]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.put('/:id', authenticateToken, multer, async (req, res) => {
    let games = req.body;
    if (req.file) {
        let imageURL=`${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        try {
          const result = await db.pool.query("update games set name=?, picture=?, available=? where id=?", [games.name,imageURL,games.available,req.params.id]);
          res.send(result);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server Error !' });
        }
    }
    else {
      try {
        const result = await db.pool.query("update games set name=?, available=? where id=?", [games.name,games.available,req.params.id]);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
      }
    } 
    
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const resultselect = await db.pool.query("select picture from games where id=?", [req.params.id]);
        const filename = resultselect[0].picture.split('/images/')[1];
        if (filename.length!=0) {
          fs.unlink(`images/${filename}`,
            (err => {
                if (err) console.log(err);
            }));
        }
        const result = await db.pool.query("delete from games where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });

module.exports = router;