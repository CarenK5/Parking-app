const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure you have the User model defined
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed
const { body, validationResult } = require('express-validator'); // For input validation

// Display registration form
router.get('/signup', (req, res) => {
    res.render('signup'); // Renders the signup form
});

// Handle user registration
router.post('/register', 
    // Validate inputs
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    async (req, res) => {
        const { username, email, password, role } = req.body;

        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Hash the password before saving
        try {
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, async function(err, passwordHash) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to hash the password' });
                }
                const newUser = new User({ username, email, passwordHash, role });
                const savedUser = await newUser.save();
                res.redirect('/login'); // Redirect to login page after successful registration

            });

           
        } catch (err) {
            res.status(500).json({ error: 'Server error, please try again later: ',err }); // Handle registration errors
        }
    }
);

module.exports = router;
