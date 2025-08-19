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
    let imageUrl = "";
    if (req.file) {
        imageUrl = `/images/${req.file.filename}`;
    }
    try {
        const result = await db.pool.query("insert into games (name,picture,available) values (?,?,?)", [games.name,imageUrl,games.available]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.put('/:id', authenticateToken, multer, async (req, res) => {
    let games = req.body;
    
    try {
      // Get current game info to handle old image deletion
      const currentGame = await db.pool.query("select picture from games where id=?", [req.params.id]);
      let oldImagePath = null;
      if (currentGame.length > 0 && currentGame[0].picture) {
        oldImagePath = currentGame[0].picture;
      }

      if (req.file) {
        // New image uploaded - delete old image and add new one
        let imageUrl = `/images/${req.file.filename}`;

        // Delete old image file if it exists
        if (oldImagePath) {
          const actualFilename = oldImagePath.includes('/images/') ? oldImagePath.split('/images/')[1] : oldImagePath;
          if (actualFilename && actualFilename.length > 0) {
            const localFilepath = `images/${actualFilename}`;
            
            if (fs.existsSync(localFilepath)) {
              fs.unlink(localFilepath, (err) => {
                if (err) {
                  console.error(`Error deleting old image ${localFilepath}:`, err);
                }
              });
            }
          }
        }
        
        const result = await db.pool.query("update games set name=?, picture=?, available=? where id=?", [games.name,imageUrl,games.available,req.params.id]);
        res.send(result);
      }
      else if (games.removeImage === 'true') {
        // Remove image request - delete file and clear DB
        if (oldImagePath) {
          const actualFilename = oldImagePath.includes('/images/') ? oldImagePath.split('/images/')[1] : oldImagePath;
          if (actualFilename && actualFilename.length > 0) {
            const localFilepath = `images/${actualFilename}`;
            
            if (fs.existsSync(localFilepath)) {
              fs.unlink(localFilepath, (err) => {
                if (err) {
                  console.error(`Error deleting image ${localFilepath}:`, err);
                }
              });
            }
          }
        }
        
        const result = await db.pool.query("update games set name=?, picture=?, available=? where id=?", [games.name,'',games.available,req.params.id]);
        res.send(result);
      }
      else {
        // No image change - just update name and availability
        const result = await db.pool.query("update games set name=?, available=? where id=?", [games.name,games.available,req.params.id]);
        res.send(result);
      }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const resultselect = await db.pool.query("select picture from games where id=?", [req.params.id]);
        if (resultselect.length > 0 && resultselect[0].picture) {
          const filename = resultselect[0].picture;
          // Check if it's a filename or a URL (backward compatibility)
          const actualFilename = filename.includes('/images/') ? filename.split('/images/')[1] : filename;
          if (actualFilename && actualFilename.length > 0) {
            const localFilepath = `images/${actualFilename}`;
            
            if (fs.existsSync(localFilepath)) {
              fs.unlink(localFilepath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                }
              });
            }
          }
        }
        const result = await db.pool.query("delete from games where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });

module.exports = router;