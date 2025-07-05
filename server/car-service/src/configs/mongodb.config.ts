import mongoose from 'mongoose';
import { Db } from 'mongodb';
import dotenv from 'dotenv';
import { logger } from '@amrogamal/shared-code';
dotenv.config();

export const mongodbConnect = async (): Promise<Db | void> => {
  try {
    await mongoose.connect(String(process.env.MONGODB_URI), {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('Connected to MongoDB!');
    logger.info(`MongoDB Connection State:${mongoose.connection.readyState}`);
    return mongoose.connection.db;
  } catch (error) {
    logger.error(error);
  }
};
