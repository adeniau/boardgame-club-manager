const express = require('express');
const router = express.Router();
const db = require('../middleware/db');
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');
const bcrypt = require('bcrypt');
const multer = require('../middleware/multer-config');
const fs = require('fs');

// GET
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from members order by name,firstname");
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from members where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/NewMembers/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from new_members where id_season=? order by name,firstname", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/MembersBorrows/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from members_borrows where id_season=? ", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  router.get('/MemberBorrows/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.pool.query("select * from members_borrows where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });
  // POST
  router.post('/', authenticateApiKey, multer, async (req, res) => {
    let members = req.body;
    let imageURL = "";
    if (req.file) {
        imageURL=`${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }
    const admin_password = await bcrypt.hash(members.admin_password, 10);
    if (members.admin == 0) {
      try {
        const result = await db.pool.query("insert into members (name,firstname,adress,postal_code,city,email,birth_date,phone_number,picture,admin_password,discord_tag,admin) values (?,?,?,?,?,?,?,?,?,?,?,?)",[members.name,members.firstname,members.adress,members.postal_code,members.city,members.email,members.birth_date,members.phone_number,imageURL,"",members.discord_tag,members.admin]);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
      }  
    }
    else { 
      try {
        const result = await db.pool.query("insert into members (name,firstname,adress,postal_code,city,email,birth_date,phone_number,picture,admin_password,discord_tag,admin) values (?,?,?,?,?,?,?,?,?,?,?,?)",[members.name,members.firstname,members.adress,members.postal_code,members.city,members.email,members.birth_date,members.phone_number,imageURL,admin_password,members.discord_tag,members.admin]);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
      }  
    }
     
  });
  router.put('/:id', authenticateToken, multer, async (req, res) => {
      let members = req.body;
      const admin_password = await bcrypt.hash(members.admin_password, 10);
      if (members.admin == 0) {
        if (req.file) {
          let imageURL=`${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
          try {
            const result = await db.pool.query("update members set name=?, firstname=?, adress=?,postal_code=?,city=?,email=?,birth_date=?,phone_number=?,picture=?,admin_password=?,discord_tag=?,admin=? where id=?", [members.name,members.firstname,members.adress,members.postal_code,members.city,members.email,members.birth_date,members.phone_number,imageURL,"",members.discord_tag,members.admin,req.params.id]);
            res.send(result);
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server Error !' });
          }
        }
        else {
          try {
            const result = await db.pool.query("update members set name=?, firstname=?, adress=?,postal_code=?,city=?,email=?,birth_date=?,phone_number=?,admin_password=?,discord_tag=?,admin=? where id=?", [members.name,members.firstname,members.adress,members.postal_code,members.city,members.email,members.birth_date,members.phone_number,"",members.discord_tag,members.admin,req.params.id]);
            res.send(result);
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server Error !' });
          }
        }
      }
      else {
        if (req.file) {
          let imageURL=`${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
          try {
            const result = await db.pool.query("update members set name=?, firstname=?, adress=?,postal_code=?,city=?,email=?,birth_date=?,phone_number=?,picture=?,admin_password=?,discord_tag=?,admin=? where id=?", [members.name,members.firstname,members.adress,members.postal_code,members.city,members.email,members.birth_date,members.phone_number,imageURL,admin_password,members.discord_tag,members.admin,req.params.id]);
            res.send(result);
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server Error !' });
          }
        }
        else {
          try {
            const result = await db.pool.query("update members set name=?, firstname=?, adress=?,postal_code=?,city=?,email=?,birth_date=?,phone_number=?,admin_password=?,discord_tag=?,admin=? where id=?", [members.name,members.firstname,members.adress,members.postal_code,members.city,members.email,members.birth_date,members.phone_number,admin_password,members.discord_tag,members.admin,req.params.id]);
            res.send(result);
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server Error !' });
          }
        }

      }
      
    });

  router.delete('/:id', authenticateToken, async (req, res) => {
    //let members = req.body;
    try {
        const resultselect = await db.pool.query("select picture from games where id=?", [req.params.id]);
        const filename = resultselect[0].picture.split('/images/')[1];
        if (filename.length!=0) {
          fs.unlink(`images/${filename}`,
            (err => {
                if (err) console.log(err);
            }));
        }
        const result = await db.pool.query("delete from members where id=?", [req.params.id]);
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error !' });
    }
  });


module.exports = router;