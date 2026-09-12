import mongoose, { Schema, Document } from 'mongoose';

export interface IGatcCentre extends Document {
  code: string;
  name: string;
  location: string;
  nablAccreditationNo: string;
  validUntil: string;
  testingCapacities: string[];
  activeTestQueue: number;
  status: 'Operational' | 'Audit Underway' | 'High Capacity';
  approvedFirstScheduleIds?: string[];
  iso17025Accredited?: boolean;
  jurisdictionArea?: string;
  consumerComplaintNumber?: string;
  contactPerson: string;
  createdAt: Date;
  updatedAt: Date;
}

const GatcCentreSchema = new Schema<IGatcCentre>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    nablAccreditationNo: { type: String, required: true },
    validUntil: { type: String, required: true },
    testingCapacities: [{ type: String }],
    approvedFirstScheduleIds: [{ type: String }],
    iso17025Accredited: { type: Boolean, default: true },
    jurisdictionArea: { type: String },
    consumerComplaintNumber: { type: String },
    activeTestQueue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Operational', 'Audit Underway', 'High Capacity'],
      default: 'Operational'
    },
    contactPerson: { type: String, required: true }
  },
  { timestamps: true }
);

export const GatcCentreModel = mongoose.model<IGatcCentre>('GatcCentre', GatcCentreSchema);
