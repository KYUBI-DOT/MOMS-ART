const express = require("express");
const db = require("../config/db");
const router = express.Router();
// const { ensureAdmin } = require('../middleware/auth'); // Not used, remove if not needed

// Middleware to check if user is logged in
function ensureLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Home Page - featured products
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

// Static Pages
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login', { error: null }));
router.get('/signin', (req, res) => res.render('signin'));
router.get('/articles', (req, res) => res.render('articles'));
router.get('/stores', (req, res) => res.render('stores'));
router.get('/p1', (req, res) => res.render('p1'));
router.get('/A1', (req, res) => res.render('A1'));
router.get('/A2', (req, res) => res.render('A2'));
router.get('/A3', (req, res) => res.render('A3'));

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.send('Error logging out');
    }
    res.redirect('/');
  });
});

// Helper to get cart items from session cart object (which stores productId -> quantity)
function getCartItemsFromCartObject(cart) {
  return new Promise((resolve, reject) => {
    const productIds = Object.keys(cart);
    if (productIds.length === 0) return resolve([]);

    const placeholders = productIds.map(() => '?').join(',');
    const sql = `SELECT id, name, price, image FROM products WHERE id IN (${placeholders})`;

    db.query(sql, productIds, (err, products) => {
      if (err) return reject(err);

      const items = products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        product_price: p.price,
        image: p.image,
        quantity: cart[p.id]
      }));

      resolve(items);
    });
  });
}

// Logged-in user dashboard showing address and cart
router.get('/logined', ensureLoggedIn, async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Fetch user address
    const addressResults = await new Promise((resolve, reject) => {
      const sql = 'SELECT street, city, state, zip, country FROM users WHERE id = ?';
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (addressResults.length === 0) {
      return res.status(404).send("User not found.");
    }

    const address = addressResults[0];
    const isAddressMissing = !address.street || !address.city || !address.state || !address.zip || !address.country;

    // Get cart from session as object {productId: quantity}
    const sessionCart = req.session.cart || {};
    const cart = await getCartItemsFromCartObject(sessionCart);

    // Merge user session data with address for rendering
    const userWithAddress = {
      ...req.session.user,
      ...address
    };

    res.render('logined', {
      user: userWithAddress,
      showForm: isAddressMissing,
      cart
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send("Database error.");
  }
});

// POST /logined/address - update address
router.post('/logined/address', ensureLoggedIn, (req, res) => {
  const { street, city, state, zip, country } = req.body;
  const userId = req.session.user.id;

  const sql = 'UPDATE users SET street = ?, city = ?, state = ?, zip = ?, country = ? WHERE id = ?';
  db.query(sql, [street, city, state, zip, country, userId], (err) => {
    if (err) {
      console.error(err);
      // In case of error, show form again with error message
      // Note: here user session data won't have updated address, so we pass current user session data
      return res.render('logined', { user: req.session.user, showForm: true, error: 'Failed to update address' });
    }

    // Update session user data with new address info
    Object.assign(req.session.user, { street, city, state, zip, country });

    res.redirect('/logined');
  });
});
router.post('/logined', ensureLoggedIn, (req, res) => {
  const { product_id, action } = req.body;

  if (!product_id || !action) {
    return res.status(400).json({ success: false, error: "Invalid request" });
  }

  if (!req.session.cart) {
    req.session.cart = {};
  }

  const currentQty = Number(req.session.cart[product_id]) || 0;

  if (action === 'increment') {
    req.session.cart[product_id] = currentQty + 1;
  } else if (action === 'decrement') {
    if (currentQty > 1) {
      req.session.cart[product_id] = currentQty - 1;
    } else {
      delete req.session.cart[product_id];
    }
  } else {
    return res.status(400).json({ success: false, error: "Invalid action" });
  }

  res.json({
    success: true,
    product_id,
    quantity: req.session.cart[product_id] || 0
  });
});

// POST /login - authenticate user
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

    // TODO: Replace with hashed password comparison using bcrypt or similar
    if (password === user.password) {
      req.session.user = user;
      res.redirect('/logined');
    } else {
      res.render('login', { error: 'Incorrect password' });
    }
  });
});

// Shop page with pagination and sorting
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
    case "newest": orderClause = " ORDER BY date_uploaded DESC"; break;
    case "oldest": orderClause = " ORDER BY date_uploaded ASC"; break;
    case "recommended": orderClause = " ORDER BY rating DESC"; break;
    case "ascending": orderClause = " ORDER BY price ASC"; break;
    case "descending": orderClause = " ORDER BY price DESC"; break;
    default: orderClause = ""; break;
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
      res.render('shop', { products, currentPage: page, totalPages, shopsort, category });
    });
  });
});

// Product Detail Page
router.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  db.query("SELECT * FROM products WHERE id = ?", [productId], (err, results) => {
    if (err) return res.status(500).send("Database error.");
    if (results.length === 0) return res.status(404).send("Product not found.");
    res.render('product-detail', { product: results[0] });
  });
});

// Cart page - show cart from session
router.get('/cart', async (req, res) => {
  const sessionCart = req.session.cart || {};
  try {
    const cart = await getCartItemsFromCartObject(sessionCart);

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
  } catch (err) {
    console.error("Error fetching cart products:", err);
    res.status(500).send("Error loading cart.");
  }
});

// Add product to cart
router.post('/cart/add/:id', (req, res) => {
  const productId = req.params.id;

  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Product not found or DB error:', err);
      return res.status(404).send("Product not found");
    }

    const product = results[0];

    // Initialize cart as an object mapping productId -> quantity
    if (!req.session.cart) req.session.cart = {};

    // Product IDs in session cart are keys as strings, so ensure string keys
    const prodIdKey = product.id.toString();

    if (req.session.cart[prodIdKey]) {
      req.session.cart[prodIdKey] += 1;
    } else {
      req.session.cart[prodIdKey] = 1;
    }

    res.redirect('/cart');
  });
});

// Update cart item quantity (increment/decrement)
router.post('/update_quantity', (req, res) => {
  const { product_id, action } = req.body;
  if (!req.session.cart) req.session.cart = {};

  if (!req.session.cart[product_id]) {
    // Product not in cart, redirect back
    return res.redirect('/cart');
  }

  if (action === 'increment') {
    req.session.cart[product_id] += 1;
  } else if (action === 'decrement' && req.session.cart[product_id] > 1) {
    req.session.cart[product_id] -= 1;
  }
  res.redirect('/cart');
});

// Remove product from cart
router.post('/cart/remove/:id', (req, res) => {
  const productId = req.params.id;
  if (!req.session.cart) req.session.cart = {};

  delete req.session.cart[productId];
  res.redirect('/cart');
});

// Newsletter subscription
router.post('/subscribe', (req, res) => {
  const email = req.body.email;

  if (!email) return res.status(400).send("Email is required.");

  db.query("INSERT INTO newsletter (email) VALUES (?)", [email], (err) => {
    if (err) {
      console.error('Newsletter subscription error:', err);
      return res.status(500).send("Error saving email.");
    }
    res.redirect('back');
  });
});

module.exports = router;
