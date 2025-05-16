const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const { request } = require("http");

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

// Store db globally if needed elsewhere
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

// Set view engine to hbs
app.set('view engine', 'hbs');

// Register Handlebars partials
const partialsDir = path.join(__dirname, "views", "partials");
hbs.registerPartials(partialsDir);

// Register Handlebars helpers
hbs.registerHelper('multiply', (price, quantity) => (price * quantity).toFixed(2));
hbs.registerHelper('calculateTotal', (cart) => {
  let total = 0;
  cart.forEach(item => total += item.price * item.quantity);
  return total.toFixed(2);
});

// Routes
app.use('/', require('./routes/userRoutes'));
app.use('/auth', require('./routes/auth'));

// Home Route
app.get('/', (req, res) => {
  const query = "SELECT * FROM product LIMIT 3";

  db.query(query, (error, result) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).send("Error fetching products.");
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    res.render('product', {
      products: result,
      cart: req.session.cart
    });
  });
});app.post('/add_cart', (request, response) => {
    const product_id = request.body.product_id;
    const product_name = request.body.product_name;
    const product_price = request.body.product_price;
    let count = 0;

    // Check if product already exists in cart
    for (let i = 0; i < request.session.cart.length; i++) {
        if (request.session.cart[i].product_id === product_id) {
            request.session.cart[i].quantity += 1;  // Increment quantity
            count++;
            break;  // Stop the loop once the product is found
        }
    }

    // If the product doesn't exist, add it to the cart
    if (count === 0) {
        const cart_data = {
            product_id: product_id,
            product_name: product_name,
            product_price: parseFloat(product_price),  // Corrected price parsing
            quantity: 1
        };
        request.session.cart.push(cart_data);  // Corrected typo in 'session'
    }

    response.redirect("/");  // Redirect to the homepage or wherever needed
});app.post('/update_quantity', (req, res) => {
  const { product_id, action } = req.body;
  
  // Ensure the cart exists
  if (!req.session.cart) {
    req.session.cart = [];
  }

  console.log('Product ID:', product_id);
  console.log('Action:', action);
  
  // Find the product in the cart
  const product = req.session.cart.find(item => item.id == product_id); // Ensure 'id' matches

  if (product) {
    // Update the quantity based on the action
    if (action === 'increment') {
      product.quantity += 1;  // Increase quantity
    } else if (action === 'decrement' && product.quantity > 1) {
      product.quantity -= 1;  // Decrease quantity, ensure it doesn't go below 1
    }
    console.log('Updated product:', product);
  } else {
    console.log('Product not found in cart');
  }

  // Redirect back to the cart page
  res.redirect('/cart');
});
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`Search results for: ${query}`);
});
app.get('/shop', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  const products = await Product.find().skip(skip).limit(limit);
  res.render("shop", {
  products,
  shopsort: req.query.shopsort,
  category: req.query.category
});

});// Register all helpers here before routes or app.listen
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
hbs.registerHelper('calculateWeekly', function(price) {
  return (price / 10).toFixed(2);
});

hbs.registerHelper('calculateAfterpay', function(price) {
  return (price / 4).toFixed(2);
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
