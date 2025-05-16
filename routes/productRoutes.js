const express = require("express");
const mysql = require("mysql");
const db = require("../db");
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');

// User Routes 

// Home Page
router.get('/', (req, res) => res.render('index'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Login Page
router.get('/login', (req, res) => res.render('login'));

router.get('/signin', (req, res) => res.render('signin'));


// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/');
  });
});

// After Login - User Dashboard
router.get('/logined', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('logined', { user: req.session.user });
});


// ---------- Static Pages ---------- //

router.get('/articles', (req, res) => res.render('articles'));
router.get('/stores', (req, res) => res.render('stores'));
router.get('/p1', (req, res) => res.render('p1'));
router.get('/A1', (req, res) => res.render('A1'));
router.get('/A2', (req, res) => res.render('A2'));
router.get('/A3', (req, res) => res.render('A3'));
router.get('/shop', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const productsPerPage = 8;
  const offset = (page - 1) * productsPerPage;

  const { shopsort, category } = req.query;

  let baseQuery = "FROM products";
  let whereClause = "";
  let orderClause = "";
  const params = [];

  // Category filter
  if (category) {
    whereClause = " WHERE category = ?";
    params.push(category);
  }

  // Sorting
  if (shopsort === "newest") {
    orderClause = " ORDER BY date_uploaded DESC";
  } else if (shopsort === "oldest") {
    orderClause = " ORDER BY date_uploaded ASC";
  } else if (shopsort === "recommended") {
    orderClause = " ORDER BY rating DESC";
  }

  // Count query (to calculate total pages)
  const countQuery = `SELECT COUNT(*) AS count ${baseQuery} ${whereClause}`;

  db.query(countQuery, params, (err, countResult) => {
    if (err) {
      console.error("❌ Count error:", err);
      return res.status(500).send("Database error.");
    }

    const totalProducts = countResult[0].count;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Pagination + sorting
    const paginatedQuery = `SELECT * ${baseQuery} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const productParams = [...params, productsPerPage, offset];

    db.query(paginatedQuery, productParams, (err, products) => {
      if (err) {
        console.error("❌ Product query error:", err);
        return res.status(500).send("Error loading products.");
      }

      res.render('shop', {
        products,
        currentPage: page,
        totalPages,
        shopsort,
        category
      });
    });
  });
});



// ---------- Shopping Cart Functionality ---------- //

// Display Cart
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  let total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  res.render('cart', { cart, total });
});

// Add Product to Cart
router.post('/cart/add/:id', (req, res) => {
  const productId = req.params.id;

  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).send("Product not found");
    }

    //If the product is found, it checks if the cart exists in the session
    const product = results[0];
    if (!req.session.cart) req.session.cart = [];

    const existingItem = req.session.cart.find(item => item.id == product.id);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      req.session.cart.push({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image, 
        quantity: 1 
      });
    }

    res.redirect('/cart');
  });
});

// Remove Product from Cart
router.post('/cart/remove/:id', (req, res) => {
  const productId = req.params.id;
  if (!req.session.cart) req.session.cart = [];

  req.session.cart = req.session.cart.filter(item => item.id != productId);
  res.redirect('/cart');
});

/* Checkout and Clear Cart
router.post('/cart/checkout', (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart');
  }

  // Simulate Payment Success
  req.session.cart = [];
  res.send('<h2>Payment successful!</h2><p>Thank you for shopping with Mom\'s Art.</p><a href="/">Go back to home</a>');
});**/



//router.get('/admin-dashboard', ensureAdmin, (req, res) => res.render('admin-dashboard'));


// Export the Router
module.exports = router;
