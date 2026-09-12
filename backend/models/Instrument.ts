import mongoose, { Schema, Document } from 'mongoose';

export type InstrumentCategoryType =
  | 'Mass / Weights'
  | 'Volume / Flow'
  | 'Pressure / Gas'
  | 'Precision Balances'
  | 'Dimensional'
  | 'electronic_scales_weighbridges'
  | 'weights_and_measures'
  | 'storage_tanks';

export interface IInstrument extends Omit<Document, 'model'> {
  instrumentId: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNo: string;
  capacity: string;
  category: InstrumentCategoryType;
  accuracyClass: string;
  owner?: mongoose.Types.ObjectId | any;
  ownerName: string;
  location: string;
  qrHash: string;
  lastVerified: string;
  nextVerificationDue: string;
  status: 'Compliant' | 'Due for Renewal' | 'Expiring Soon' | 'Expired' | 'Violation Reported';
  createdAt: Date;
  updatedAt: Date;
}

const InstrumentSchema = new Schema<IInstrument>(
  {
    instrumentId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    manufacturer: { type: String, default: 'Standard Manufacturer' },
    model: { type: String, default: 'Standard Model' },
    serialNo: { type: String, required: true, index: true },
    capacity: { type: String, default: '30 kg' },
    category: {
      type: String,
      default: 'electronic_scales_weighbridges'
    },
    accuracyClass: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    ownerName: { type: String, required: true },
    location: { type: String, required: true },
    qrHash: { type: String, required: true },
    lastVerified: { type: String, default: 'Pending' },
    nextVerificationDue: { type: String, default: 'Pending' },
    status: {
      type: String,
      enum: ['Compliant', 'Due for Renewal', 'Expiring Soon', 'Expired', 'Violation Reported'],
      default: 'Compliant'
    }
  },
  { timestamps: true }
);

export const InstrumentModel = mongoose.model<IInstrument>('Instrument', InstrumentSchema);
