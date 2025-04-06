const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require('path');
const hbs = require('hbs');  // Add this to set up Handlebars


dotenv.config({ path: './.env' }); //same path as server.js


const app = express(); // Initialize express app
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const publicDirectory = path.join(__dirname, './public');//PD is were we will put files like css or js for front 
console.log(__dirname)
app.use(express.urlencoded({ extended: false })); // Parses form data
app.use(express.json()); // Parses JSON requests

app.use(express.static(publicDirectory));

app.set('view engine', 'hbs');

//req from form, what to send to frontend 
//define routes
app.use('/',require('./routes/userRoutes'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
