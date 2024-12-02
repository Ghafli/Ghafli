import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await dbConnect();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        errors: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      statistics: {
        cardsCreated: 0,
        cardsStudied: 0,
        totalStudyTime: 0,
      },
    });

    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userObject,
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors,
      });
    }

    res.status(500).json({ 
      message: 'Error creating user', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
}
