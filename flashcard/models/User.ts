import { Schema, model, models } from 'mongoose';

interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  statistics: {
    cardsCreated: number;
    cardsStudied: number;
    totalStudyTime: number;
    lastStudySession?: Date;
  };
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  statistics: {
    cardsCreated: { type: Number, default: 0 },
    cardsStudied: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 },
    lastStudySession: { type: Date, required: false },
  },
});

// Check if the model exists before creating a new one
const User = models.User || model<IUser>('User', userSchema);

export default User;
