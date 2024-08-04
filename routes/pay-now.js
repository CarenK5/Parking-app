const express = require('express')
const axios = require('axios')
require('dotenv').config()
const router = express.Router()
const {ObjectId} = require('mongodb')
const request = require('request')
const moment = require('moment')
const { v4:uuidv4 } = require('uuid')
const {client} = require('../db')
const bookColl = client.db('parkingDB').collection('bookings')
const streetsColl = client.db('parkingDB').collection('streets')
//initiate client session
const session = client.startSession()

// Function to get OAuth token
const getOAuthToken = async () => {
    const auth = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString('base64');
    try {
        const { data } = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });
        return data.access_token;
    } catch (error) {
        console.error('Error getting OAuth token:', error);
    }
};

// Function to initiate Lipa Na M-Pesa Online payment
const lipaNaMpesaOnline = (phone, amount) => {
    return new Promise((resolve, reject) => {
        generateAccessToken()
        .then((access_token) => {
            const URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
            const Auth = 'Bearer ' + access_token;
            const timestamp = moment().format('YYYYMMDDHHmmss');
            const password = Buffer.from(process.env.SHORT_CODE + process.env.PASSKEY + timestamp).toString('base64');

            request({
                url: URL,
                method: 'POST',
                headers: {
                    Authorization: Auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    BusinessShortCode: process.env.SHORT_CODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: amount,
                    PartyA: phone,
                    PartyB: process.env.SHORT_CODE, // Ensure this is defined in your environment variables
                    PhoneNumber: phone,
                    CallBackURL: 'https://4a1c-197-180-251-184.ngrok-free.app/',
                    AccountReference: "ParkingFee",
                    TransactionDesc: "Parking payment"
                })
            }, (error, response, body) => {
                if (error) {
                    console.log(error)
                } else {
                    resolve(JSON.parse(body));
                    console.log(body)
                }
            });
        })
        .catch(reject);
    });
};
// Endpoint for M-Pesa payment
router.post('/pay', async (req, res) => {
    const { phone, amount, street, long, lat } = req.body
    const transactionId = uuidv4()
    const userId = req.user._id
    try {
        
        const transaction_result = await session.withTransaction(
            async () => {
                const response = await lipaNaMpesaOnline(phone, amount)
                if(response){
                    await bookColl.updateOne(
                        {transactionId:transactionId},
                        {$set:{
                            userId:userId,
                            phoneNumber:phone,
                            amount:amount,
                            createdAt: new Date(),
                            street:street,
                            long:long,
                            lat:lat,
                            transaction_details:response
                        }},
                        {upsert:true},
                        {session}
                        
                )
    
                //update the street collection
                await streetsColl.updateOne(
                    {streetName:street},
                    {$inc: {bookings:1}},
                    {upsert:true},
                    {session}
                )
    
                console.log('Comitting transactions...')
               
                }
               
                
            }
        )
        
        res.status(200).json(
            {
                status:'success',
                message:'Booking done successfully'
            }
        );
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
    finally{
        await session.endSession()
    }
});

//generate Mpesa Access token
function generateAccessToken(){
    const consumerKey=process.env.CONSUMER_KEY
    const consumerSecret=process.env.CONSUMER_SECRET
    const URL='https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    const Auth='Basic '+new Buffer.from(consumerKey+':'+consumerSecret).toString('base64')
    return new Promise((response,reject)=>{
        request({
            url:URL,
            headers:{
                Authorization: Auth
            },
        },function (error,res,body){
            let jsonBody=JSON.parse(body);
            if(error) reject(error);
            else{
                const access_token=jsonBody.access_token
                response(access_token);
            }
        })
    })
}


// Callback endpoint
router.post('/mpesa-callback', (req, res) => {
    console.log('M-Pesa Callback received:', req.body);
    
    // Handle the callback data here. You can save it to your database if needed.
    
    // Always respond to Safaricom with a 200 OK status
    res.status(200).send('Callback received successfully');
});

module.exports = router;
