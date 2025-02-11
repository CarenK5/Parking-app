// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.static(path.join(__dirname, )));

// Database connection
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB using mongoose
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Test MongoDB connection using MongoClient
const client = new MongoClient(MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB using MongoClient:", error);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);

// Define routes
const userRoutes = require('./routes/user');
const parkingLotRoutes = require('./routes/parking');
const reservationRoutes = require('./routes/my-bookings');
const paymentRoutes = require('./routes/pay-now');
const rentSpaceRoute = require('./routes/rent-space'); // Ensure correct path

// Use routes
app.use('/user', userRoutes);
app.use('/parking', parkingLotRoutes);
app.use('/my-bookings', reservationRoutes);
app.use('/pay-now', paymentRoutes);
app.use('/rent-space', rentSpaceRoute); // Mount rent-space route

// Default route
app.get('/', (req, res) => {
    res.render('index', {
        azureMapsKey: process.env.AZURE_MAPS_KEY
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
