import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { User } from '../models/User';
import { Application } from '../models/Application';
import { InstrumentModel } from '../models/Instrument';
import { Certificate } from '../models/Certificate';
import { LmoOfficerModel } from '../models/LmoOfficer';
import { StakeholderModel } from '../models/Stakeholder';
import { GatcCentreModel } from '../models/GatcCentre';
import { AlertModel } from '../models/Alert';
import { InquiryModel } from '../models/Inquiry';
import { seedDatabase } from './seedDatabase';
import { getAppConfig } from '../config/env';

export async function resetDatabase() {
  const mongoURI = getAppConfig().mongoUri;

  console.log('Connecting to MongoDB for database reset...');
  try {
    const conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
    console.log(`Connected to MongoDB host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

    await Promise.all([
      User.deleteMany({}),
      Application.deleteMany({}),
      InstrumentModel.deleteMany({}),
      Certificate.deleteMany({}),
      LmoOfficerModel.deleteMany({}),
      StakeholderModel.deleteMany({}),
      GatcCentreModel.deleteMany({}),
      AlertModel.deleteMany({}),
      InquiryModel.deleteMany({})
    ]);

    await seedDatabase();

    console.log('Database reset and seed completed.');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Applications: ${await Application.countDocuments()}`);
    console.log(`Instruments: ${await InstrumentModel.countDocuments()}`);
    console.log(`Certificates: ${await Certificate.countDocuments()}`);

    await mongoose.disconnect();
  } catch (err: any) {
    console.error('Database reset failed:', err?.message || err);
    throw err;
  }
}

if (process.argv[1]?.includes('resetDatabase')) {
  resetDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
