import mongoose, { Schema } from 'mongoose';

export type InstrumentCategory =
  | 'electronic_scales_weighbridges'
  | 'weights_and_measures'
  | 'storage_tanks';

export interface ICertificate {
  certificateId: string;
  instrumentId: string;
  owner: string;
  ownerRef?: mongoose.Types.ObjectId | any;
  instrumentRef?: mongoose.Types.ObjectId | any;
  applicationRef?: mongoose.Types.ObjectId | any;
  lmoRef?: mongoose.Types.ObjectId | any;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  capacity: string;
  verificationDate: string;
  verificationDateUtc?: Date;
  validityPeriod: string;
  expiryDate: string;
  expiryDateUtc?: Date;
  lmoId: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'suspended' | 'condemned';
  instrument: string;
  category: InstrumentCategory;
  warningThresholdDays: number;
  daysRemaining: number;
  qrPayload?: string;
  verifiedBy?: string;
  establishmentAddress?: string;
  eInterval?: string;
  pdfUrl?: string;
  digitalSignatureHash?: string;
  signature?: {
    algorithm: 'Ed25519';
    keyId: string;
    signature: string;
    signedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    instrumentId: { type: String, required: true },
    owner: { type: String, required: true },
    ownerRef: { type: Schema.Types.ObjectId, ref: 'User' },
    instrumentRef: { type: Schema.Types.ObjectId, ref: 'Instrument' },
    applicationRef: { type: Schema.Types.ObjectId, ref: 'Application' },
    lmoRef: { type: Schema.Types.ObjectId, ref: 'User' },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true, index: true },
    accuracyClass: { type: String, required: true },
    capacity: { type: String, required: true },
    verificationDate: { type: String, required: true },
    verificationDateUtc: { type: Date, index: true },
    validityPeriod: { type: String, required: true },
    expiryDate: { type: String, required: true },
    expiryDateUtc: { type: Date, index: true },
    lmoId: { type: String, required: true },
    status: {
      type: String,
      enum: ['valid', 'expiring_soon', 'expired', 'suspended', 'condemned'],
      default: 'valid'
    },
    instrument: { type: String, required: true },
    category: {
      type: String,
      enum: ['electronic_scales_weighbridges', 'weights_and_measures', 'storage_tanks'],
      default: 'electronic_scales_weighbridges'
    },
    warningThresholdDays: { type: Number, default: 30 },
    daysRemaining: { type: Number, default: 365 },
    qrPayload: { type: String },
    verifiedBy: { type: String },
    establishmentAddress: { type: String },
    eInterval: { type: String },
    pdfUrl: { type: String },
    digitalSignatureHash: { type: String },
    signature: {
      algorithm: { type: String, enum: ['Ed25519'] },
      keyId: { type: String },
      signature: { type: String },
      signedAt: { type: Date }
    }
  },
  { timestamps: true }
);

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
