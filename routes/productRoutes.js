const express = require("express");
const router = express.Router();
const db = require("../db");

// -----------------------------
// GET: Product Detail with Recommendations
// -----------------------------
router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await getProductById(productId);
    if (!product) return res.status(404).send("Product not found");

    const recommendations = await getRecommendedProducts(productId);

    res.render('product-detail', {
      product,
      recommendations,
      calculateWeekly: Math.round(product.price / 4),
      calculateAfterpay: Math.round(product.price / 4),
    });
  } catch (err) {
    console.error("❌ Error loading product:", err);
    res.status(500).send("Server error");
  }
});

// -----------------------------
// POST: Add to Cart
// -----------------------------
router.post('/add-to-cart', (req, res) => {
  const { product_id, product_name, product_price, image } = req.body;

  if (!req.session.cart) req.session.cart = [];

  req.session.cart.push({
    product_id,
    product_name,
    product_price: parseFloat(product_price),
    quantity: 1,
    image
  });

  req.session.itemAdded = true;
  res.redirect('/cart');
});

// -----------------------------
// GET: Cart Page
// -----------------------------
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const itemAdded = req.session.itemAdded;
  req.session.itemAdded = null; // flash message cleanup

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

  res.render('cart', {
    cart,
    itemAdded,
    totalItems,
    totalPrice
  });
});

// -----------------------------
// Utilities
// -----------------------------
function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM product WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

function getRecommendedProducts(excludeId) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM product WHERE id != ? ORDER BY RAND() LIMIT 2',
      [excludeId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = router;
