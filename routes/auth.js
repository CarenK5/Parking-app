const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure you have the User model defined
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed
const { body, validationResult } = require('express-validator'); // For input validation

// Display registration form
router.get('/login', (req, res) => {
    res.render('login'); // Renders the signup form
});

// Handle user registration
router.post('/log', 
    // Validate inputs
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    async (req, res) => {
        const { email, password} = req.body;
        //req.body.role = 'user';
        

        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Hash the password before saving
        try {
            //const savedUser = await newUser.save();
            const user= await User.findOne({email: email});
            console.log(user)
            const hash= user.passwordHash;
            console.log(hash)
        
            res.redirect('/');
           
            
        } catch (err) {
            res.status(500).json({ error: 'Server error, please try again later: ',err }); // Handle registration errors
        }
    }
);

module.exports = router;
