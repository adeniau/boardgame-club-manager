const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');

// GET
router.get('/ByMember/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from memberships where id_member=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/BySeason/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from memberships where id_season=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/Current/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from current_members where id_season=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  // POST
  router.post('/', authenticateToken, async (req, res) => {
    let memberships = req.body;
    try {
        const result = await db.pool.query("insert into memberships (id_member,id_season,deposit) values (?,?,?)", [memberships.id_member,memberships.id_season,memberships.deposit]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    let memberships = req.body;
    try {
        const result = await db.pool.query("update memberships set deposit=? where id_member=? and id_season=?", [memberships.deposit,req.params.id,memberships.id_season]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    let memberships = req.body;
    try {
        const result = await db.pool.query("delete from memberships where id_member=? and id_season=?", [req.params.id,memberships.id_season]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });

module.exports = router;