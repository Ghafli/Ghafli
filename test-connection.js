const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  connectTimeoutMS: 60000, // Increase timeout to 60 seconds
  socketTimeoutMS: 60000,
  serverSelectionTimeoutMS: 60000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 1
});

async function run() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    console.log('Attempting ping...');
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Connection error:", {
      message: error.message,
      code: error.code,
      name: error.name
    });
  } finally {
    await client.close();
  }
}

run();
