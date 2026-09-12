import mongoose, { Schema, Document } from 'mongoose';

export interface IGatcApplication extends Document {
  applicationNo: string;
  applicantFullName: string;
  applicantAddress: string;
  contactEmail: string;
  contactPhone: string;
  appliedFirstScheduleItems: string[];
  applicantFunctionDetails: string;
  nablCertificateNo: string;
  nablIssueDate: string;
  nablValidUntil: string;
  accreditationBody: string;
  relevantExperienceYears: number;
  relevantExperienceSummary: string;
  totalEmployeesCount: number;
  technicalStaffParticulars: string;
  totalOrganizationAreaSqMeters: number;
  proposedGatcLabAreaSqMeters: number;
  principalOfficerName: string;
  principalOfficerQualification: string;
  deputyOfficerName: string;
  deputyOfficerQualification: string;
  referenceStandardsAvailable: string;
  testingFacilitiesSummary: string;
  iso17025Trained: boolean;
  trainingInstituteName: string;
  trainingDetails: string;
  qmsManualRefNo: string;
  qmsManualAvailable: boolean;
  weightsMeasuresTestingExperience: string;
  additionalPerformanceInfo?: string;
  demandDraftNo: string;
  demandDraftDate: string;
  demandDraftBank: string;
  demandDraftAmount: string;
  proposedJurisdictionArea: string;
  statutoryUndertakingAgreed: boolean;
  undertakingDate: string;
  consumerComplaintNumber: string;
  grievressalOfficer?: string;
  grievanceRedressalOfficer: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  reviewRemarks?: string;
  assignedInspector?: string;
  approvedCentreCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GatcApplicationSchema = new Schema<IGatcApplication>(
  {
    applicationNo: { type: String, required: true, unique: true, index: true },
    applicantFullName: { type: String, required: true },
    applicantAddress: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    appliedFirstScheduleItems: [{ type: String, required: true }],
    applicantFunctionDetails: { type: String, required: true },
    nablCertificateNo: { type: String, required: true },
    nablIssueDate: { type: String, required: true },
    nablValidUntil: { type: String, required: true },
    accreditationBody: { type: String, default: 'NABL' },
    relevantExperienceYears: { type: Number, default: 0 },
    relevantExperienceSummary: { type: String, required: true },
    totalEmployeesCount: { type: Number, default: 1 },
    technicalStaffParticulars: { type: String, required: true },
    totalOrganizationAreaSqMeters: { type: Number, required: true },
    proposedGatcLabAreaSqMeters: { type: Number, required: true },
    principalOfficerName: { type: String, required: true },
    principalOfficerQualification: { type: String, required: true },
    deputyOfficerName: { type: String, required: true },
    deputyOfficerQualification: { type: String, required: true },
    referenceStandardsAvailable: { type: String, required: true },
    testingFacilitiesSummary: { type: String, required: true },
    iso17025Trained: { type: Boolean, default: true },
    trainingInstituteName: { type: String, required: true },
    trainingDetails: { type: String, required: true },
    qmsManualRefNo: { type: String, required: true },
    qmsManualAvailable: { type: Boolean, default: true },
    weightsMeasuresTestingExperience: { type: String, required: true },
    additionalPerformanceInfo: { type: String },
    demandDraftNo: { type: String, required: true },
    demandDraftDate: { type: String, required: true },
    demandDraftBank: { type: String, required: true },
    demandDraftAmount: { type: String, default: '₹25,000' },
    proposedJurisdictionArea: { type: String, required: true },
    statutoryUndertakingAgreed: { type: Boolean, required: true, default: false },
    undertakingDate: { type: String, required: true },
    consumerComplaintNumber: { type: String, required: true },
    grievanceRedressalOfficer: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'REJECTED'],
      default: 'SUBMITTED'
    },
    reviewRemarks: { type: String },
    assignedInspector: { type: String },
    approvedCentreCode: { type: String }
  },
  { timestamps: true }
);

export const GatcApplicationModel = mongoose.model<IGatcApplication>('GatcApplication', GatcApplicationSchema);
