// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module
const session = require('express-session'); // Include session middleware
const axios = require('axios');
const {connectToDb} = require('./db')
const app = express();
const passport = require('passport')
require('./creds/passport')(passport)
const {ensureAuthenticated} = require('./creds/auth')
const port = process.env.PORT || 5000;

//connect to the database
connectToDb()

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.static(path.join(__dirname,))); // Ensure this points to the correct directory
app.use(
    session({
        secret:'andi4343094',
        resave:true,
        saveUninitialized:true,
        cookie:{
            maxAge:30*60*1000
        }
    })
)
app.use(passport.initialize())
app.use(passport.session())


// Define routes
const userRoutes = require('./routes/user');
const reservationRoutes = require('./routes/my-bookings');
const paymentRoutes = require('./routes/pay-now');
const rentSpaceRoute = require('./routes/rent-space'); // Ensure correct path
const bookingRoutes = require('./routes/book');
const listRoutes = require('./routes/list');


// Use routess
app.use('/user', userRoutes);
app.use('/my-bookings', ensureAuthenticated,reservationRoutes);
app.use('/pay-now', ensureAuthenticated,paymentRoutes);
app.use('/rent-space', ensureAuthenticated,rentSpaceRoute); // Mount rent-space route
app.use('/book', ensureAuthenticated,bookingRoutes); // Mount the book route
app.use('/list', ensureAuthenticated,listRoutes)
app.use('/auth', require('./routes/auth'));

// Default route
app.get('/', ensureAuthenticated,(req, res) => {
    res.render('index', {
        azureMapsKey: process.env.AZURE_MAPS_KEY
    });
});

app.get('/signup', (req, res) => {
    res.render('signup'); // Assuming signup.ejs is in the views directory
});

app.get('/login', (req, res) => {
    res.render('login'); // Assuming signup.ejs is in the views directory
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});

// Start the Express server
app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`);
});



