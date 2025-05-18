const express = require("express");
const mysql = require("mysql");
const db = require("../config/db");
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');

// Middleware to check if user is logged in
function ensureLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Home Page
router.get('/', (req, res) => {
  const query = "SELECT * FROM products WHERE id BETWEEN 1 AND 8";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching featured products:", err);
      return res.status(500).send("Database error.");
    }
    res.render('index', { products: results });
  });
});

// Auth Pages
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login', { error: null }));
router.get('/signin', (req, res) => res.render('signin'));

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error logging out');
    res.redirect('/');
  });
});

// Login POST handler
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.render('login', { error: 'Something went wrong. Try again.' });
    }

    const user = results[0];

    if (!user) {
      return res.render('login', { error: 'User not found' });
    }

    // TODO: Replace with hashed password verification
    if (password === user.password) {
      req.session.user = user; // Save full user object in session
      res.redirect('/logined');
    } else {
      res.render('login', { error: 'Incorrect password' });
    }
  });
});

// Logged-in user account page
router.get('/logined', ensureLoggedIn, (req, res) => {
  const userId = req.session.user.id;

  const sql = 'SELECT street, city, state, zip, country FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error.");
    }

    if (results.length === 0) {
      return res.status(404).send("User not found.");
    }

    const address = results[0];

    // Check if any address field is missing or empty
    const isAddressMissing =
      !address.street || !address.city || !address.state || !address.zip || !address.country;

    // Build updated user data with address fields
    const userWithAddress = {
      ...req.session.user,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    };

    res.render('logined', {
      user: userWithAddress,
      showForm: isAddressMissing,
    });
  });
});


// Update address POST handler
router.post('/logined/address', ensureLoggedIn, (req, res) => {
  const { street, city, state, zip, country } = req.body;
  const userId = req.session.user.id;

  const sql = 'UPDATE users SET street = ?, city = ?, state = ?, zip = ?, country = ? WHERE id = ?';
  db.query(sql, [street, city, state, zip, country, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.render('logined', { user: req.session.user, showForm: true, error: 'Failed to update address' });
    }

    // Update session user data
    req.session.user.street = street;
    req.session.user.city = city;
    req.session.user.state = state;
    req.session.user.zip = zip;
    req.session.user.country = country;

    res.redirect('/logined');
  });
});

// Static Pages
router.get('/articles', (req, res) => res.render('articles'));
router.get('/stores', (req, res) => res.render('stores'));
router.get('/p1', (req, res) => res.render('p1'));
router.get('/A1', (req, res) => res.render('A1'));
router.get('/A2', (req, res) => res.render('A2'));
router.get('/A3', (req, res) => res.render('A3'));

// Shop with pagination and sorting
router.get('/shop', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const productsPerPage = 8;
  const offset = (page - 1) * productsPerPage;

  const { shopsort, category } = req.query;

  let baseQuery = "FROM products";
  let whereClause = "";
  let orderClause = "";
  const params = [];

  if (category) {
    whereClause = " WHERE category = ?";
    params.push(category);
  }

  switch (shopsort) {
    case "newest":
      orderClause = " ORDER BY date_uploaded DESC";
      break;
    case "oldest":
      orderClause = " ORDER BY date_uploaded ASC";
      break;
    case "recommended":
      orderClause = " ORDER BY rating DESC";
      break;
    case "ascending":
      orderClause = " ORDER BY price ASC";
      break;
    case "descending":
      orderClause = " ORDER BY price DESC";
      break;
  }

  const countQuery = `SELECT COUNT(*) AS count ${baseQuery} ${whereClause}`;

  db.query(countQuery, params, (err, countResult) => {
    if (err) return res.status(500).send("Database error.");
    const totalProducts = countResult[0].count;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const paginatedQuery = `SELECT * ${baseQuery} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const productParams = [...params, productsPerPage, offset];

    db.query(paginatedQuery, productParams, (err, products) => {
      if (err) return res.status(500).send("Error loading products.");
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

// Product Detail
router.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  db.query("SELECT * FROM products WHERE id = ?", [productId], (err, results) => {
    if (err) return res.status(500).send("Database error.");
    if (results.length === 0) return res.status(404).send("Product not found.");
    res.render('product-detail', { product: results[0] });
  });
});

// Cart Functionality

// View Cart
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  let totalPrice = 0;
  let totalItems = 0;

  cart.forEach(item => {
    totalPrice += item.product_price * item.quantity;
    totalItems += item.quantity;
  });

  res.render('cart', {
    cart,
    totalPrice: totalPrice.toFixed(2),
    totalItems
  });
});

// Add to Cart
router.post('/cart/add/:id', (req, res) => {
  const productId = req.params.id;

  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err || results.length === 0) return res.status(500).send("Product not found");

    const product = results[0];
    if (!req.session.cart) req.session.cart = [];

    const existingItem = req.session.cart.find(item => item.product_id == product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      req.session.cart.push({
        product_id: product.id,
        product_name: product.name,
        product_price: parseFloat(product.price),
        image: product.image,
        quantity: 1
      });
    }

    res.redirect('/cart');
  });
});

// Update Quantity
router.post('/update_quantity', (req, res) => {
  const { product_id, action } = req.body;
  const cart = req.session.cart || [];

  const product = cart.find(item => item.product_id == product_id);
  if (product) {
    if (action === 'increment') product.quantity += 1;
    if (action === 'decrement' && product.quantity > 1) product.quantity -= 1;
  }

  req.session.cart = cart;
  res.redirect('/cart');
});

// Remove from Cart
router.post('/cart/remove/:id', (req, res) => {
  const productId = req.params.id;
  if (!req.session.cart) req.session.cart = [];

  req.session.cart = req.session.cart.filter(item => item.product_id != productId);
  res.redirect('/cart');
});

// Newsletter Subscription
router.post('/subscribe', (req, res) => {
  const email = req.body.email;
  const query = "INSERT INTO newsletter (email) VALUES (?)";

  db.query(query, [email], (err) => {
    if (err) return res.status(500).send("Error saving email.");
    res.redirect('back');
  });
});

module.exports = router;
