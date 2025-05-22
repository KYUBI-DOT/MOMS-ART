const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ----------------------------------------------
// Admin Login
// ----------------------------------------------
exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("admin-login", { message: "All fields are required" });
  }

  db.query("SELECT * FROM admin WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.render("admin-login", { message: "Database error" });
    }

    if (result.length === 0) {
      return res.render("admin-login", { message: "Invalid email or password" });
    }

    const admin = result[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.render("admin-login", { message: "Invalid email or password" });
    }

    // Store admin in session
    req.session.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    console.log("Admin logged in:", req.session.admin);
    return res.redirect("/admin/dashboard");
  });
};

// ----------------------------------------------
// View All Products
// ----------------------------------------------
exports.viewProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).send("Server error");
    }

    res.render("admin-manageproduct", {
      products: results,
      admin: req.session.admin
    });
  });
};

// ----------------------------------------------
// Show Edit Product Form
// ----------------------------------------------
exports.editProductForm = (req, res) => {
  const productId = req.params.id;

  db.query("SELECT * FROM products WHERE id = ?", [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res.status(500).send("Server Error");
    }

    if (results.length === 0) {
      return res.status(404).send("Product not found");
    }

    res.render("admin-editproduct", {
      product: results[0],
      admin: req.session.admin
    });
  });
};

// ----------------------------------------------
// Handle Product Update Submission
// ----------------------------------------------
exports.updateProduct = (req, res) => {
  const productId = req.params.id;
  const { name, category, price } = req.body;

  db.query(
    "UPDATE products SET name = ?, category = ?, price = ? WHERE id = ?",
    [name, category, price, productId],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).send("Error updating product");
      }

      res.redirect("/admin/dashboard/manage-products");
    }
  );
};
