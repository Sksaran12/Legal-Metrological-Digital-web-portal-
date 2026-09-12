import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  ticketNo: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  responseNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    ticketNo: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    topic: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
      index: true
    },
    responseNotes: { type: String }
  },
  { timestamps: true }
);

export const InquiryModel = mongoose.model<IInquiry>('Inquiry', InquirySchema);
