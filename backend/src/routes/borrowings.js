const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');

// GET
router.get('/ByMember/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from borrowings where id_member=? order by borrow_date desc", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/ByGame/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from borrowings where id_game=? order by borrow_date desc", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/CurrentBorrowings/', authenticateApiKey, async (req, res) => {
    try {
        const result = await db.pool.query("select * from current_borrowings order by borrow_date desc");
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/TotalBorrowings/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from total_borrows where id_season=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/TotalGames/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from total_games_borrows where id_season=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  // POST
  router.post('/', authenticateToken, async (req, res) => {
    let borrowings = req.body;
    try {
        const result = await db.pool.query("insert into borrowings (id_season,id_member,id_game,borrow_date) values (?,?,?,?)", [borrowings.id_season,borrowings.id_member,borrowings.id_game,borrowings.borrow_date]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    let borrowings = req.body;
    try {
        const result = await db.pool.query("update borrowings set return_date=?,comment=? where id=?", [borrowings.return_date,borrowings.comment,req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("delete from borrowings where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });

module.exports = router;