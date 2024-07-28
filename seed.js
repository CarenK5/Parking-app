const mongoose = require('mongoose');
const ParkingSpace = require('./models/parkingspace'); // Adjust the path as per your project structure

mongoose.connect('mongodb://localhost:27017/your-db-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const parkingSpaces = [
    {
        owner: 'CK',
        location: '-1.2921, 36.8219',
        price: 200,
        description: 'Suitable for medium-sized cars',
        available: true
    },
    {
        owner: 'John Doe',
        location: '-1.286389, 36.817223',
        price: 150,
        description: 'Suitable for small cars',
        available: true
    }
];

ParkingSpace.insertMany(parkingSpaces)
    .then(() => {
        console.log('Data seeded successfully');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error seeding data:', err);
        mongoose.connection.close();
    });
