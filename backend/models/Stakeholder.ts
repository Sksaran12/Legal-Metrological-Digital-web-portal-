import mongoose, { Schema, Document } from 'mongoose';

export interface IStakeholder extends Document {
  registrationNo: string;
  enterpriseName: string;
  ownerName: string;
  enterpriseType: 'Manufacturer' | 'Importer' | 'Trader / Retailer' | 'Repairer' | 'Bulk Weighbridge Depot';
  licenseNo: string;
  zone: string;
  registeredDevices: number;
  complianceScore: number;
  status: 'Active' | 'Pending Verification' | 'Notice Issued' | 'certified' | 'pending' | 'flagged';
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const StakeholderSchema = new Schema<IStakeholder>(
  {
    registrationNo: { type: String, required: true, unique: true, index: true },
    enterpriseName: { type: String, required: true },
    ownerName: { type: String, required: true },
    enterpriseType: {
      type: String,
      enum: ['Manufacturer', 'Importer', 'Trader / Retailer', 'Repairer', 'Bulk Weighbridge Depot'],
      required: true
    },
    licenseNo: { type: String, required: true },
    zone: { type: String, required: true },
    registeredDevices: { type: Number, default: 0 },
    complianceScore: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['Active', 'Pending Verification', 'Notice Issued', 'certified', 'pending', 'flagged'],
      default: 'Active'
    },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true }
  },
  { timestamps: true }
);

export const StakeholderModel = mongoose.model<IStakeholder>('Stakeholder', StakeholderSchema);
