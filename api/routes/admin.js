const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const supabase = getDb();
  
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (error || !user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, email: user.email });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ id: req.admin.id, email: req.admin.email });
});

module.exports = router;
