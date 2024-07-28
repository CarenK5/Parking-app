// models/parkingspace.js

const { TopologyDescription } = require('mongodb');
const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: {type: String, default: ''},    // Add more fields as needed
    available: { type: Boolean, default: true }
});

module.exports = mongoose.model('ParkingSpace', parkingSpaceSchema);
