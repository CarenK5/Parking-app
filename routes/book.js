
// routes/bookings.js

const express = require('express');
const router = express.Router();
const ParkingSpace = require('../models/parkingspace');
const Booking = require('../models/book');

//render booking page
router.get('/app/book', (req,res) => {
    const phoneNumber = req.user.phone
    res.render('book',{phoneNumber})
})

// Route to handle booking requests
router.post('/book', async (req, res) => {
    const { location, startTime, endTime } = req.body;

    // Assuming user ID is stored in the session
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    try {
        // Ensure all required fields are provided
        if (!location || !startTime || !endTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate date format
        if (isNaN(Date.parse(startTime)) || isNaN(Date.parse(endTime))) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Fetch a parking space by location
        const parkingSpace = await ParkingSpace.findOne({ location, available: true });

        // Check if the parking space exists
        if (!parkingSpace) {
            return res.status(404).json({ message: 'No available parking space found at this location' });
        }

        // Create a new booking
        const newBooking = new Booking({
            userId,
            parkingSpaceId: parkingSpace._id,
            startTime,
            endTime
        });

        // Save the booking to the database
        await newBooking.save();

        // Mark the parking space as unavailable
        parkingSpace.available = false;
        await parkingSpace.save();

        // Respond with the created booking
        res.status(201).json(newBooking);
    } catch (err) {
        console.error('Error booking parking space:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
