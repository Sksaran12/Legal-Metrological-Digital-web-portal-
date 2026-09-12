import mongoose, { Schema, Document } from 'mongoose';

export type AlertType =
  | 'Seal Tampering'
  | 'Expired Verification'
  | 'Unauthorized Alteration'
  | 'Deviation Exceeds MPE'
  | 'SLA Breach Threat';

export interface IAlert extends Document {
  alertNo: string;
  type: AlertType;
  severity: 'Critical' | 'High' | 'Moderate';
  entityName: string;
  location: string;
  zone: string;
  reportedAt: string;
  status: 'Pending Dispatch' | 'Investigation Active' | 'Warrant Issued' | 'Resolved';
  actionTaken: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertNo: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: [
        'Seal Tampering',
        'Expired Verification',
        'Unauthorized Alteration',
        'Deviation Exceeds MPE',
        'SLA Breach Threat'
      ],
      required: true
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Moderate'],
      default: 'Moderate'
    },
    entityName: { type: String, required: true },
    location: { type: String, required: true },
    zone: { type: String, required: true },
    reportedAt: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending Dispatch', 'Investigation Active', 'Warrant Issued', 'Resolved'],
      default: 'Pending Dispatch'
    },
    actionTaken: { type: String, default: 'Awaiting initial triage' },
    details: { type: String }
  },
  { timestamps: true }
);

export const AlertModel = mongoose.model<IAlert>('Alert', AlertSchema);
