const LocalStrategy = require('passport-local').Strategy
const { ObjectId } = require('mongodb')
const { client, connectToDb } = require('../db')
const userAcc = client.db('parkingDB').collection('users')
const bcrypt = require('bcrypt')



module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
            try {
                if (!email || !password) {
                    return done(null, false, { message: 'Kindly check the email entered or register for a new account.' });
                }

                //await connectToDb()
                
                // Find the user
                let user = await userAcc.findOne({ email: email })
                
                if (!user) {
                    return done(null, false, { message: 'No user found with this email.' });
                }

                // Check the password
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) return done(err);
                    if (result) return done(null, user);
                    return done(null, false, { message: 'The password is incorrect.' });
                });
            } catch (error) {
                console.log(`This error occurred while trying to login: ${error}`);
                return done(error);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            await connectToDb()
            let user = await userAcc.findOne({ _id: new ObjectId(id) });
            
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        } catch (error) {
            done(error, null);
        }
    });
};