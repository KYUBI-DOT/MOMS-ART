// searchRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = req.query.q || '';
  const shopsort = req.query.shopsort;
  const category = req.query.category;

  if (!query) {
    return res.render('searchResult', { query: '', products: [], shopsort, category });
  }

  const sql = `
    SELECT * FROM products
    WHERE name LIKE ? OR category LIKE ?
    LIMIT 20
  `;

  const likeQuery = `%${query}%`;

  db.query(sql, [likeQuery, likeQuery], (err, results) => {
    if (err) {
      console.error('Error searching products:', err);
      return res.status(500).send('Error performing search.');
    }

    // Start with raw DB results
    let filteredProducts = results;

    // Apply category filter if selected
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Apply sorting
    if (shopsort === 'ascending') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (shopsort === 'descending') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (shopsort === 'newest') {
      filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (shopsort === 'oldest') {
      filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    // Add 'recommended' logic if needed

    res.render('searchResult', {
      query,
      shopsort,
      category,
      products: filteredProducts
    });
  });
});

module.exports = router;
