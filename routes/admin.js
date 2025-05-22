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

// Manage Products Page
router.get("/dashboard/manage-products", isAdminLoggedIn, authController.viewProducts);

// Show Edit Product Form
router.get("/dashboard/products/:id/edit", isAdminLoggedIn, authController.editProductForm);

// Handle Edit Submission
router.post("/dashboard/products/:id/edit", isAdminLoggedIn, authController.updateProduct);

// Toggle Product Activation
router.post("/dashboard/products/:id/deactivate", isAdminLoggedIn, authController.toggleProductStatus);


// View Users
router.get("/dashboard/manage-users", isAdminLoggedIn, authController.viewUsers);

// Edit User
router.get("/dashboard/users/:id/edit", isAdminLoggedIn, authController.editUserForm);
router.post("/dashboard/users/:id/edit", isAdminLoggedIn, authController.updateUser);

// Toggle User Status (Activate/Deactivate)
router.post("/dashboard/users/:id/deactivate", isAdminLoggedIn, authController.toggleUserStatus);



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
