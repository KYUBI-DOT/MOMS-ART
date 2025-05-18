const express = require("express");
const router = express.Router();
const db = require("../db"); // or wherever your db connection is

// Get single product with random recommendations
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

// Fetch main product by ID
function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM product WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

// Get 2 random products excluding the current one
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
