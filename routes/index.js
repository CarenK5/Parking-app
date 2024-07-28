const express = require('express');
const router = express.Router();
const ParkingSpace = require('./models/ParkingSpace');

// Home route with search functionality
router.get('/', async (req, res) => {
    const { location } = req.query;
    let spaces = [];

    if (location) {
        spaces = await ParkingSpace.find({ location: new RegExp(location, 'i'), available: true });
    }

    res.render('index', { spaces, location, azureMapsKey: process.env.AZURE_MAPS_KEY });
});

// Pay Now route
router.get('/pay-now', (req, res) => {
    res.render('pay-now');
});

// Help route
router.get('/help', (req, res) => {
    res.render('help');
});
// Route handler for GET / (home page with available parking spaces)
router.get('/', async (req, res) => {
    try {
        const parkingSpaces = await ParkingSpace.find({ available: true });
        res.render('index', { spaces: parkingSpaces, azureMapsKey: process.env.AZURE_MAPS_KEY });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});
module.exports = router;
