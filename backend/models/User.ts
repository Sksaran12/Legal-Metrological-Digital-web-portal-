import mongoose, { Schema, Document } from 'mongoose';

export type UserRole =
  | 'owner'
  | 'manufacturer'
  | 'dealer'
  | 'repairer'
  | 'importer'
  | 'lmo'
  | 'officer'
  | 'gatc'
  | 'administrator'
  | 'business'
  | 'citizen';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  identifier: string;
  roleLabel: string;
  phone?: string;
  enterpriseName?: string;
  enterpriseType?: string;
  gstin?: string;
  licenseNo?: string;
  zone?: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'owner',
        'manufacturer',
        'dealer',
        'repairer',
        'importer',
        'lmo',
        'officer',
        'gatc',
        'administrator',
        'business',
        'citizen'
      ],
      default: 'owner'
    },
    identifier: { type: String, required: true },
    roleLabel: { type: String, required: true },
    phone: { type: String, trim: true },
    enterpriseName: { type: String, trim: true },
    enterpriseType: { type: String, trim: true },
    gstin: { type: String, trim: true },
    licenseNo: { type: String, trim: true },
    zone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'active'
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
