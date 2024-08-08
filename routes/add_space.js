const express = require('express')
const {client} = require('../db')
const { v4:uuidv4 } = require('uuid')
const streetColl = client.db('parkingDB').collection('streets')
const router = express.Router()

router.get('/admin',(req,res)=>{
    res.render('space')
})

router.post('/get/spots', async (req,res)=>{
    const { streetName } = req.body
    try {
        const spots = await streetColl.find({spotName:{$regex:`^${streetName}`,$options:'i'}}).toArray()
        
        res.status(200).json(spots)
    } catch (error) {
        res.status(500).json({error_message:error})
    }
})

router.post('/insert', async (req,res) => {
   try {
        const { spotName, price, spaces, long_input, lat_input } = req.body
        //street data
        const street = {
            streetId:uuidv4(),
            price:price,
            spotName:spotName, 
            spaces:spaces, 
            long_input:long_input, 
            lat_input:lat_input
        }
        //add the street to the db
        const insert_res = await streetColl.insertOne(street)
        if(insert_res.insertedId) res.redirect('/')
        else res.redirect('/add/space/admin')
   } catch (error) {
        res.status(400).json({error_message:error})
   }
})

router.post('/get/total-bookings', async (req,res) => {
   try {
    const { street_id } = req.body
    const street = await streetColl.findOne({streetId:street_id})
    console.log(street)
    if(street) res.status(200).json(street)
    else res.status(400).json({error_message:'Bad request sent.'})

   } catch (error) {
    res.status(400).json({error_message:error})
   }


})



module.exports = router