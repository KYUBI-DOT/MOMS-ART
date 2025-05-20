const express = require("express");
const router = express.Router();
const authController = require("../controllers/adminController");
const { isAdminLoggedIn } = require("../middleware/adminAuth");

router.get("/login", (req, res) => {
  res.render("admin-login", { message: null });
});

router.post("/login", authController.loginAdmin);

router.get("/dashboard", isAdminLoggedIn, (req, res) => {
  res.render("admin-dashboard", { admin: req.session.admin });
});
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/admin/login');
  });
})
router.get('/admin/dashboard', async (req, res) => {
  try {
    // Make sure admin is logged in
    if (!req.session.admin) {
      return res.redirect('/login');  // or any other route for login
    }
    const [users] = await db.promise().query('SELECT COUNT(*) as count FROM users');
console.log('Users count:', users[0].count);

const [products] = await db.promise().query('SELECT COUNT(*) as count FROM products');
console.log('Products count:', products[0].count);

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
router.get('/admin/dashboard/manage-users', async (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/login');
  }
  
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

module.exports = router;
