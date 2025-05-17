router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await getProductById(productId); // FIXED variable name
    const recommendations = await getRecommendedProducts(product.category, productId);

    console.log("Product:", product.category);
    console.log("Recommendations:", recommendations);

    res.render('product-detail', {
      product,
      recommendations,
      calculateWeekly: Math.round(product.price / 4),
      calculateAfterpay: Math.round(product.price / 4),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
