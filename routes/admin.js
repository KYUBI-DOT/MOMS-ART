const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

router.get('/login', (req, res) => {
  res.render('admin-login', { message: null });
});

module.exports = router;
