import mongoose, { Schema, Document } from 'mongoose';

export interface ITestResult {
  testLoad: number;
  observedError: number;
  mpe: number;
  isPass: boolean;
}

export interface IVerification extends Document {
  application: mongoose.Types.ObjectId | any;
  instrument?: mongoose.Types.ObjectId | any;
  lmo: mongoose.Types.ObjectId | any;
  lmoName?: string;
  maxCapacity: number;
  eInterval: number;
  dDivision: number;
  accuracyClass: string;
  serialNumber: string;
  repeatabilityTest: ITestResult;
  eccentricityTest: ITestResult;
  linearityTest: ITestResult;
  overallResult: 'PASS' | 'FAIL';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema = new Schema<ITestResult>(
  {
    testLoad: { type: Number, required: true },
    observedError: { type: Number, required: true },
    mpe: { type: Number, required: true },
    isPass: { type: Boolean, required: true }
  },
  { _id: false }
);

const VerificationSchema = new Schema<IVerification>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    instrument: { type: Schema.Types.ObjectId, ref: 'Instrument' },
    lmo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lmoName: { type: String },
    maxCapacity: { type: Number, required: true },
    eInterval: { type: Number, required: true },
    dDivision: { type: Number, required: true },
    accuracyClass: { type: String, required: true },
    serialNumber: { type: String, required: true },
    repeatabilityTest: { type: TestResultSchema, required: true },
    eccentricityTest: { type: TestResultSchema, required: true },
    linearityTest: { type: TestResultSchema, required: true },
    overallResult: { type: String, enum: ['PASS', 'FAIL'], required: true },
    remarks: { type: String }
  },
  { timestamps: true }
);

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);
