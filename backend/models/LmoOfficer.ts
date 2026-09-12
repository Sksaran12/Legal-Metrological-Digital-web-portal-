import mongoose, { Schema, Document } from 'mongoose';

export interface ILmoOfficer extends Document {
  badgeNo: string;
  name: string;
  zone: string;
  zoneCode: string;
  status: 'On Site' | 'Transit' | 'Available' | 'On Leave';
  statusClass: string;
  inspectionsToday: number;
  completedThisMonth: number;
  stampingCertsIssued: number;
  phone: string;
  email: string;
  avatar: string;
  currentLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

const LmoOfficerSchema = new Schema<ILmoOfficer>(
  {
    badgeNo: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    zone: { type: String, required: true },
    zoneCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['On Site', 'Transit', 'Available', 'On Leave'],
      default: 'Available'
    },
    statusClass: { type: String, required: true },
    inspectionsToday: { type: Number, default: 0 },
    completedThisMonth: { type: Number, default: 0 },
    stampingCertsIssued: { type: Number, default: 0 },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    currentLocation: { type: String, required: true }
  },
  { timestamps: true }
);

export const LmoOfficerModel = mongoose.model<ILmoOfficer>('LmoOfficer', LmoOfficerSchema);
