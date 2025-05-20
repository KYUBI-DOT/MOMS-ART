const db = require('../config/db');
const bcrypt = require('bcryptjs');
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
