const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const searchRoutes = require('./routes/searchRoutes'); 

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
global.db = db;

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

// Register helpers
hbs.registerHelper('multiply', (price, quantity) => (price * quantity).toFixed(2));
hbs.registerHelper('calculateTotal', (cart) => {
  let total = 0;
  cart.forEach(item => total += item.product_price * item.quantity);
  return total.toFixed(2);
});
hbs.registerHelper('eq', (a, b) => a == b);
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('lt', (a, b) => a < b);
hbs.registerHelper('increment', value => value + 1);
hbs.registerHelper('decrement', value => value - 1);
hbs.registerHelper("unless", (value, options) => !value ? options.fn(this) : options.inverse(this));
hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper("range", function (start, end) {
  let range = [];
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});
hbs.registerHelper('calculateWeekly', price => (price / 10).toFixed(2));
hbs.registerHelper('calculateAfterpay', price => (price / 4).toFixed(2));

// Set global user object for views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Routes
app.use('/', require('./routes/userRoutes'));
app.use('/auth', require('./routes/auth'));

// Home route
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

// Add to cart
app.post('/add_cart', (req, res) => {
  const { product_id, product_name, product_price } = req.body;
  let cart = req.session.cart || [];

  let product = cart.find(item => item.product_id === product_id);
  if (product) {
    product.quantity += 1;
  } else {
    cart.push({
      product_id,
      product_name,
      product_price: parseFloat(product_price),
      quantity: 1
    });
  }

  req.session.cart = cart;
  res.redirect("/");
});

// Update cart quantity
app.post('/update_quantity', (req, res) => {
  const { product_id, action } = req.body;
  const cart = req.session.cart || [];

  const product = cart.find(item => item.product_id === product_id);

  if (product) {
    if (action === 'increment') {
      product.quantity += 1;
    } else if (action === 'decrement' && product.quantity > 1) {
      product.quantity -= 1;
    }
  }

  res.redirect('/cart');
});

// Cart page
app.get('/cart', (req, res) => {
  res.render('cart', {
    cart: req.session.cart || []
  });
});
app.use('/search', searchRoutes);


// Shop page 
app.get('/shop', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 8;
  const offset = (page - 1) * limit;

  const query = "SELECT * FROM product LIMIT ?, ?";
  db.query(query, [offset, limit], (err, products) => {
    if (err) return res.status(500).send("Error loading shop products");

    res.render("shop", {
      products,
      shopsort: req.query.shopsort,
      category: req.query.category
    });
  });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});