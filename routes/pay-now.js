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
            const Auth = 'Bearer ' + access_token
            let timestamp = moment().format('YYYYMMDDHHmmss');
            
            const password = Buffer.from(process.env.SHORT_CODE + process.env.PASSKEY + timestamp).toString('base64');

            const reqBody = {
                BusinessShortCode: 174379,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: parseInt(amount),
                PartyA: parseInt(phone),
                PartyB: 174379, // Ensure this is defined in your environment variables
                PhoneNumber: parseInt(phone),
                CallBackURL: 'https://7a69-196-96-209-70.ngrok-free.app/book/spot/callback',
                AccountReference: "ParkGo",
                TransactionDesc: "Parking payment"
            }

            console.log(reqBody)

            request({
                url: URL,
                method: 'POST',
                headers: {
                    Authorization: Auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqBody)
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
    const { phone, amount, street_id, long, lat } = req.body
    
    const userId = req.user._id
    try {
        const streetData = await streetsColl.findOne({streetId:street_id})
        //check if booking limit was reached
       if(parseInt(streetData.bookings) == streetData.spaces){
            return res.status(400).json(
                {
                    status:'failed',
                    message:'Failed to make payment. No spots available.',
                }
            )
       }else{
        const transaction_result = await session.withTransaction(
            async () => {
                const response = await lipaNaMpesaOnline(phone, amount)
                if(!response.errorMessage){
                    await bookColl.updateOne(
                        {transactionId:response.MerchantRequestID},
                        {$set:{
                            userId:userId,
                            phoneNumber:phone,
                            amount:amount,
                            createdAt: new Date(),
                            streetId:street_id,
                            long:long,
                            lat:lat,
                            transaction_details:response
                        }},
                        {upsert:true},
                        {session}
                        
                )
    
                //update the street collection
                await streetsColl.updateOne(
                    {streetId:street_id},
                    {$inc: {bookings:1}},
                    {upsert:true},
                    {session}
                )
    
                console.log('Comitting transactions...')
                res.status(201).json(
                    {
                        status:'success',
                        message:'Booking done successfully'
                    }
                );
               
                }else{
                    return res.status(400).json(
                    {
                        status:'failed',
                        message:'Failed to make payment.',
                        system_msg:response.errorMessage
                    }
                )
                }
               
                
            }
        )
        
       }
      
    } catch (error) {
        //console.log(error)
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
router.post('/callback', async (req, res) => {
    console.log('M-Pesa Callback received:', req.body);
    
    const callbackData = req.body;

    try {
        // Update the transaction status in the database
        await transactionsColl.updateOne(
            { transactionId: callbackData.TransactionId },
            { $set: { 
                status: callbackData.ResultCode === 0 ? 'Success' : 'Failed',
                details: callbackData 
            } }
        );
        console.log('Transaction status updated successfully');
    } catch (error) {
        console.error('Error updating transaction status:', error);
    }

    // Always respond to Safaricom with a 200 OK status
    res.status(200).send('Callback received successfully');
});

module.exports = router;
