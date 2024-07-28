const express = require('express');
const axios = require('axios');
require('dotenv').config();
const Transaction = require('../models/pay-now');

const router = express.Router();

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
const lipaNaMpesaOnline = async (phone, amount) => {
    const token = await getOAuthToken();
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
    const password = Buffer.from(`${process.env.SHORT_CODE}${process.env.PASSKEY}${timestamp}`).toString('base64');

    try {
        const { data } = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            BusinessShortCode: process.env.SHORT_CODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phone,
            PartyB: process.env.SHORT_CODE,
            PhoneNumber: phone,
            CallBackURL: ' https://589f-41-89-99-5.ngrok-free.app', // Replace with your actual callback URL
            AccountReference: 'ParkingFee',
            TransactionDesc: 'Parking payment'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (error) {
        console.error('Error making STK push request:', error);
    }
};

// Endpoint for M-Pesa payment
router.post('/mpesa-payment', async (req, res) => {
    const { phone, amount } = req.body;

    try {
        const response = await lipaNaMpesaOnline(phone, amount);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(error.response.data);
    }
});

// Callback endpoint
router.post('/mpesa-callback', (req, res) => {
    console.log('M-Pesa Callback received:', req.body);
    
    // Handle the callback data here. You can save it to your database if needed.
    
    // Always respond to Safaricom with a 200 OK status
    res.status(200).send('Callback received successfully');
});

module.exports = router;
