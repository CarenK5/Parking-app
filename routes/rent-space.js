const express = require('express');
const router = express.Router();
const ParkingSpace = require('../models/parkingspace'); // Adjust the path as per your project structure

// Route handler for GET /rent-space (list all available parking spaces)
router.get('/', async (req, res) => {
    try {
        // Fetch all available parking spaces from MongoDB
        const parkingSpaces = await ParkingSpace.find({ available: true });

        // Render the home page with the list of parking spaces
        res.render('rent-space', { spaces: parkingSpaces, azureMapsKey: process.env.AZURE_MAPS_KEY });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route handler to handle form submission to add a parking space
router.post('/add', async (req, res) => {
    const { owner, location, price, description } = req.body;

    // Basic validation
    if (!owner || !location || !price) {
        return res.status(400).json({ message: 'Owner, location, and price are required.' });
    }

    if (isNaN(price)) {
        return res.status(400).json({ message: 'Price must be a valid number.' });
    }

    try {
        // Create a new parking space listing
        const newParkingSpace = new ParkingSpace({
            owner, // Assuming you have a user object in the request
            location,
            price,
            description,
            available: true
        });

        // Save the parking space to the database
        await newParkingSpace.save();

        res.status(201).json({ message: `Parking space successfully listed at ${location}.` }); // Return the created parking space as JSON
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add space. Server Error' });
    }
});

// Additional GET route handler to return parking spaces as JSON
router.get('/list', async (req, res) => {
    try {
        const parkingSpaces = await ParkingSpace.find({ available: true });
        res.json(parkingSpaces); // Return the list of parking spaces as JSON
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
