const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("Connected to database");
  }
});

//  Register
exports.register = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  if (!name || !email || !password || !passwordConfirm) {
    return res.render("register", { message: "All fields are required" });
  }

  if (password !== passwordConfirm) {
    return res.render("register", { message: "Passwords do not match" });
  }

  db.query("SELECT email FROM users WHERE email = ?", [email], async (error, results) => {
    if (error) return res.status(500).send("Server error");

    if (results.length > 0) {
      return res.render("register", { message: "That email is already in use" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err) => {
          if (err) return res.status(500).send("Error registering user");
          res.render("register", { message: "User registered successfully" });
        }
      );
    } catch (err) {
      return res.status(500).send("Error processing registration");
    }
  });
};

//  Login
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", { message: "All fields are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.render("login", { message: "Database error" });
    if (result.length === 0) return res.render("login", { message: "Invalid email or password" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render("login", { message: "Invalid email or password" });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    console.log("Session user set:", req.session.user);

    if (user.role === 'admin') {
      return res.redirect("/admin-dashboard");
    } else {
      return res.redirect("/");
    }
  });
};

//  Forgot Password
exports.sendResetLink = (req, res) => {
  const { email } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0) {
      return res.render("forgot-password", { message: "Email not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    db.query(
      "UPDATE users SET reset_token = ?, token_expiry = ? WHERE email = ?",
      [token, expiry, email],
      (updateErr) => {
        if (updateErr) {
          return res.render("forgot-password", { message: "Error saving reset token" });
        }

        const resetLink = `http://localhost:5000/password-reset/${token}`;
        console.log("🔗 Reset link:", resetLink);

        return res.render("forgot-password", {
          message: "Reset link sent! (Check console)"
        });
      }
    );
  });
};

//  Render Password Change Form
exports.renderResetForm = (req, res) => {
  const { token } = req.params;

  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND token_expiry > NOW()",
    [token],
    (err, results) => {
      if (err || results.length === 0) {
        return res.send("Invalid or expired token.");
      }

      res.render("password-change", { token });
    }
  );
};

//  Handle Password Reset
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || password !== confirmPassword) {
    return res.send("Passwords do not match.");
  }

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE reset_token = ? AND token_expiry > NOW()",
    [hashed, token],
    (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.send("Invalid or expired token.");
      }

      res.send(" Password reset successful. You can now log in.");
    }
  );
};
