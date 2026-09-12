import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'UNDER VERIFICATION'
  | 'VERIFIED'
  | 'CERTIFICATE ISSUED'
  | 'FAIL'
  | 'ADJUSTMENT/REPAIR'
  | 'RE-VERIFICATION';

export type PipelineStage = 'intake' | 'review' | 'assign_lmo' | 'scheduled' | 'stamped';

export interface IStatusHistoryItem {
  status: ApplicationStatus;
  timestamp: Date;
  updatedBy?: mongoose.Types.ObjectId | any;
  updatedByName?: string;
  notes?: string;
}

export interface IApplication extends Omit<Document, 'model'> {
  appNo: string;
  date: string;
  time: string;
  submittedAt?: Date;
  owner?: mongoose.Types.ObjectId | any;
  instrument?: mongoose.Types.ObjectId | any;
  enterpriseName: string;
  enterpriseType: string;
  equipmentName: string;
  equipmentSerial: string;
  equipmentClass: string;
  instrumentType?: string;
  manufacturer?: string;
  model?: string;
  capacity?: string;
  verificationType?: string;
  installationAddress?: string;
  gpsCoordinates?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    accuracyMeters?: number;
    source: 'device_gps' | 'manual_pin' | 'address' | 'ip';
  };
  photographName?: string;
  supportingDocName?: string;
  jurisdiction: string;
  zone: string;
  status: ApplicationStatus;
  statusHistory: IStatusHistoryItem[];
  stage: PipelineStage;
  stageLabel: string;
  stageBadgeClass: string;
  assignedLmoUser?: mongoose.Types.ObjectId | any;
  assignedGatcUser?: mongoose.Types.ObjectId | any;
  assignedLmo?: {
    id: string;
    name: string;
    badgeNo: string;
    avatar: string;
    phone: string;
    zone: string;
    email?: string;
  };
  assignedGatc?: {
    id: string;
    name: string;
    code: string;
    location: string;
    phone: string;
  };
  isHighPriority?: boolean;
  slaDeadline?: string;
  accuracyTolerance?: string;
  feeAmount?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Exempted';
  txnId?: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  instrumentsList?: Array<{
    instrumentType: string;
    category?: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    capacity: string;
    accuracyClass: string;
    quantity: number;
    unitFee: number;
    subtotal: number;
  }>;
  totalInstrumentsCount?: number;
  baseFeeTotal?: number;
  stampingFeeTotal?: number;
  gstAmount?: number;
  grandTotal?: number;
  lastCalibrated?: string;
  testCentre?: string;
  certificateNo?: string;
  certificateId?: string;
  instrumentModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String },
    notes: { type: String }
  },
  { _id: false }
);

const ApplicationSchema = new Schema<IApplication>(
  {
    appNo: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    instrument: { type: Schema.Types.ObjectId, ref: 'Instrument' },
    enterpriseName: { type: String, required: true },
    enterpriseType: { type: String, required: true },
    equipmentName: { type: String, required: true },
    equipmentSerial: { type: String, required: true },
    equipmentClass: { type: String, required: true },
    instrumentType: { type: String },
    manufacturer: { type: String },
    model: { type: String },
    capacity: { type: String },
    verificationType: { type: String },
    installationAddress: { type: String },
    gpsCoordinates: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (value: number[]) => value.length === 2,
          message: 'Location coordinates must contain longitude and latitude.'
        }
      },
      accuracyMeters: { type: Number, min: 0 },
      source: {
        type: String,
        enum: ['device_gps', 'manual_pin', 'address', 'ip'],
        required: true
      }
    },
    photographName: { type: String },
    supportingDocName: { type: String },
    jurisdiction: { type: String, required: true },
    zone: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER REVIEW',
        'ASSIGNED',
        'SCHEDULED',
        'UNDER VERIFICATION',
        'VERIFIED',
        'CERTIFICATE ISSUED',
        'FAIL',
        'ADJUSTMENT/REPAIR',
        'RE-VERIFICATION'
      ],
      default: 'SUBMITTED',
      index: true
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    stage: {
      type: String,
      enum: ['intake', 'review', 'assign_lmo', 'scheduled', 'stamped'],
      default: 'intake'
    },
    stageLabel: { type: String, required: true },
    stageBadgeClass: { type: String, required: true },
    assignedLmoUser: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedGatcUser: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedLmo: {
      id: String,
      name: String,
      badgeNo: String,
      avatar: String,
      phone: String,
      zone: String
    },
    assignedGatc: {
      id: String,
      name: String,
      code: String,
      location: String,
      phone: String
    },
    isHighPriority: { type: Boolean, default: false },
    slaDeadline: { type: String },
    accuracyTolerance: { type: String },
    feeAmount: { type: String },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Exempted'],
      default: 'Pending'
    },
    txnId: { type: String },
    paymentMethod: { type: String },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    instrumentsList: [
      {
        instrumentType: String,
        category: String,
        manufacturer: String,
        model: String,
        serialNumber: String,
        capacity: String,
        accuracyClass: String,
        quantity: { type: Number, default: 1 },
        unitFee: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 }
      }
    ],
    totalInstrumentsCount: { type: Number, default: 1 },
    baseFeeTotal: { type: Number, default: 0 },
    stampingFeeTotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    lastCalibrated: { type: String },
    testCentre: { type: String }
  },
  { timestamps: true }
);

ApplicationSchema.index({ location: '2dsphere' });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
