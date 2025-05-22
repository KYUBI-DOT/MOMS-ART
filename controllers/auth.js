const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Create database connection (Move this outside the function)
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

exports.register = async (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password || !passwordConfirm) {
        return res.render("register", {
            message: "All fields are required",
        });
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
        return res.render("register", {
            message: "Passwords do not match",
        });
    }

    // Check if email already exists
    db.query("SELECT email FROM users WHERE email = ?", [email], async (error, results) => {
        if (error) {
            console.error("Database error: ", error);
            return res.status(500).send("Server error");
        }

        if (results.length > 0) {
            return res.render("register", {
                message: "That email is already in use",
            });
        }

        // Hash password
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Hashed Password: ", hashedPassword);

            db.query(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error("Error inserting user: ", err);
                        return res.status(500).send("Error registering user");
                    }
                    console.log("User registered successfully");
                    res.render("register", { message: "User registered successfully" });
                }
            );
        } catch (err) {
            console.error("Error hashing password: ", err);
            return res.status(500).send("Error processing registration");
        }
    });
};


// User Login
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render("login", { message: "All fields are required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) {
            return res.render("login", { message: "Database error" });
        }

        if (result.length === 0) {
            return res.render("login", { message: "Invalid email or password" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { message: "Invalid email or password" });
        }


        // View All Products
exports.viewProducts = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};


  // Store user in session
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
