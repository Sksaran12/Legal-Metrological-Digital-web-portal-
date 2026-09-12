import mongoose from 'mongoose';
import { getAppConfig } from './env';

export async function connectDB() {
  try {
    const { mongoUri } = getAppConfig();
    // The database name is taken from the MongoDB URI. For the current
    // configuration, this is the "test" database.
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return true;
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error?.message || error}`);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return false;
  }
}
