const express = require("express");
const router = express.Router();
const authController = require("../controllers/adminController");
const { isAdminLoggedIn } = require("../middleware/adminAuth");

// Login Page
router.get("/login", (req, res) => {
  res.render("admin-login", { message: null });
});

// Handle Login
router.post("/login", authController.loginAdmin);

// Dashboard with stats
router.get("/dashboard", isAdminLoggedIn, async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT COUNT(*) as count FROM users');
    const [products] = await db.promise().query('SELECT COUNT(*) as count FROM products');

    res.render('admin-dashboard', {
      totalUsers: users[0].count,
      totalProducts: products[0].count,
      admin: req.session.admin
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Manage Users Page
router.get("/dashboard/manage-users", isAdminLoggedIn, async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT id, name, email, city, state, country FROM users');
    res.render('admin-ManageUser', {
      users,
      admin: req.session.admin
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/admin/login');
  });
});

module.exports = router;
