const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed
const { body, validationResult } = require('express-validator'); // For input validation
const {client} = require('../db')
const userAcc = client.db('parkingDB').collection('users')
const passport = require('passport')
// Display registration form
router.get('/login', (req, res) => {
    res.render('login'); // Renders the signup form
});

// Handle user registration
router.post('/log', 
    // Validate inputs
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req,res,next) => {
        passport.authenticate('local',{
            successRedirect:'/',
            failureRedirect:'/login',
            failureFlash: false
        })(req,res,next);
    
        
    }
)

module.exports = router;
