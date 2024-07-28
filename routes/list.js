const express = require('express');
const router = express.Router();
const ParkingSpot = require('../models/parkingspot');

// Get all parking spots
router.get('/', async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find();
        res.json(parkingSpots);
    } catch (err) {
        res.status(500).json({ error: 'Server error, please try again later' });
    }
});

// Add a new parking spot
router.post('/', async (req, res) => {
    const { name, lat, lng, description } = req.body;
    const newParkingSpot = new ParkingSpot({
        name,
        location: { lat, lng },
        description
    });

    try {
        await newParkingSpot.save();
        res.json({ message: 'Parking spot successfully listed at Kisumu, Kenya.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error, please try again later' });
    }
});

module.exports = router;
