// reservation.js
const express = require('express');
const router = express.Router();

// Define routes for reservation
router.get('/', (req, res) => {
    res.send('my-bookings');
});

router.post('/', (req, res) => {
    // Logic to handle reservation
    res.send('Reservation successful');
});

module.exports = router;
