// db.js
const dotenv = require('dotenv')
const colors = require('colors')
dotenv.config()

const { MongoClient } = require('mongodb')

const MONGO_URI = process.env.MONGO_URI

const client = new MongoClient(MONGO_URI)

const connectToDb = async () => {
  try {
    await client.connect()
    console.log(`Connected to MongoDB...`.bgGreen)
  } catch (error) {
    console.log(`Error: ${error}`.bgRed)
  }
}


module.exports = {connectToDb,client}