const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure you have the User model defined
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed
const { body, validationResult } = require('express-validator'); // For input validation
const {client} = require('../db')
const userAcc = client.db('parkingDB').collection('users')

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
            bcrypt.hash(password, saltRounds, async function(err, hash) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to hash the password' });
                }
                //create user object
                const user = {
                    username:username,
                    email:email,
                    password:hash,
                    role:role?role:'user',
                    createdAt: new Date()
                }

                //check if users exist
                //count documents with the same email and username
                let db_users_check = userAcc.countDocuments({$and:[{username:user.username},{email:user.email}]})
                //console.log(await db_users_check)
                if(await db_users_check>0){
                    res.status(400).json({invalid_msg:'A user with this email or username already exists.'})
                }else{
                    //add the user to the users collection
                    let result = await userAcc.insertOne(user)
                    if(result.insertedId) res.redirect('/login')
                }
                
               

            })

           
        } catch (err) {
            res.status(500).json({ error: 'Server error, please try again later: ',err }); // Handle registration errors
        }
    }
);

module.exports = router;
