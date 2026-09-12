import mongoose, { Schema } from 'mongoose';

export interface IPayment {
  orderId: string;
  paymentId: string;
  application?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'created' | 'verified' | 'failed' | 'refunded';
  createdAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, required: true, unique: true, index: true },
    application: { type: Schema.Types.ObjectId, ref: 'Application', index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
    status: { type: String, enum: ['created', 'verified', 'failed', 'refunded'], default: 'verified' }
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
