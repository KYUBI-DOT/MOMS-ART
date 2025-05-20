const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const searchRoutes = require('./routes/searchRoutes'); 
const hbsHelpers = require('./utils/helper');
const admin = require('./routes/admin');



dotenv.config({ path: './.env' });

const app = express();

// Set up MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// Configure session
app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Set public directory
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set view engine
app.set('view engine', 'hbs');

// Register partials
const partialsDir = path.join(__dirname, "views", "partials");
hbs.registerPartials(partialsDir);

// Set global user object for views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use('/', require('./routes/userRoutes'));
app.use('/auth', require('./routes/auth'));


app.get('/', (req, res) => {
  const query = "SELECT * FROM product LIMIT 3";

  db.query(query, (error, result) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).send("Error fetching products.");
    }

    if (!req.session.cart) req.session.cart = [];

    res.render('product', {
      products: result,
      cart: req.session.cart
    });
  });
});
app.use('/search', searchRoutes);
Object.entries(hbsHelpers).forEach(([name, fn]) => {
  hbs.registerHelper(name, fn);
});
app.use('/admin', admin);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const util = require('util');
db.query = util.promisify(db.query);

module.exports = db;