const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');

// GET
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from seasons");
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from seasons where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  // POST
  router.post('/', authenticateToken, async (req, res) => {
    let seasons = req.body;
    try {
        const result = await db.pool.query("insert into seasons (year) values (?)", [seasons.year]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    let seasons = req.body;
    try {
        const result = await db.pool.query("update seasons set year=? where id=?", [seasons.year,req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });

/*
  router.delete('/:id', authenticateToken, async (req, res) => {
    //let seasons = req.body;
    try {
        const result = await db.pool.query("delete from seasons where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
*/

module.exports = router;