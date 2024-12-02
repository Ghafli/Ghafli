import { MongoClient } from 'mongodb';
import mongoose, { Connection } from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalWithMongoose extends Global {
  mongoose: {
    conn: Connection | null;
    promise: Promise<typeof mongoose> | null;
  };
}

interface GlobalWithMongoClient extends Global {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: GlobalWithMongoose & GlobalWithMongoClient;

if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

const options = {
  bufferCommands: false,
  autoIndex: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
};

export async function dbConnect(): Promise<typeof mongoose> {
  try {
    if (global.mongoose.conn) {
      console.log('Using existing mongoose connection');
      return mongoose;
    }

    if (!global.mongoose.promise) {
      console.log('Creating new mongoose connection');
      mongoose.set('strictQuery', false);
      
      global.mongoose.promise = mongoose.connect(MONGODB_URI, options);
    } else {
      console.log('Using existing mongoose promise');
    }

    try {
      await global.mongoose.promise;
      global.mongoose.conn = mongoose.connection;
      console.log('Successfully connected to MongoDB');
      return mongoose;
    } catch (error) {
      global.mongoose.promise = null;
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('MongoDB connection error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
}

// MongoDB Client connection for NextAuth
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log('MongoDB client connected successfully');
        return client;
      })
      .catch(error => {
        console.error('MongoDB client connection error:', {
          message: error.message,
          code: error.code,
          name: error.name,
          stack: error.stack
        });
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect()
    .then(client => {
      console.log('MongoDB client connected successfully');
      return client;
    })
    .catch(error => {
      console.error('MongoDB client connection error:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      throw error;
    });
}

export default clientPromise;
