import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Certificate } from '../models/Certificate';
import { Application } from '../models/Application';
import { LmoOfficerModel } from '../models/LmoOfficer';
import { InstrumentModel } from '../models/Instrument';
import { StakeholderModel } from '../models/Stakeholder';
import { GatcCentreModel } from '../models/GatcCentre';
import { AlertModel } from '../models/Alert';

import {
  INITIAL_LMOS,
  INITIAL_GATC_CENTRES,
  INITIAL_OWNER_REGISTRATIONS,
  INITIAL_ALERTS
} from '../../frontend/src/data/adminMockData';

export async function seedDatabase() {
  try {
    if (process.env.SEED_DEMO_DATA !== 'true') {
      return;
    }

    const seedPasswordValue = process.env.SEED_DEMO_PASSWORD?.trim();
    if (!seedPasswordValue || seedPasswordValue.length < 16) {
      throw new Error('SEED_DEMO_PASSWORD must contain at least 16 characters when SEED_DEMO_DATA=true.');
    }

    // 1. Seed Core Users if database is empty
    let officerUser = await User.findOne({ email: 'officer.rajesh@legalmetrology.gov.in' });
    let ownerUser = await User.findOne({ email: 'owner@apexscale.in' });
    let adminUser = await User.findOne({ email: 'admin@legalmetrology.gov.in' });
    let gatcUser = await User.findOne({ email: 'lab@mumbaigatc.gov.in' });

    const defaultPassword = await bcrypt.hash(seedPasswordValue, 12);

    if (!officerUser) {
      officerUser = await User.create({
        name: 'Inspector Rajesh Sharma',
        email: 'officer.rajesh@legalmetrology.gov.in',
        password: defaultPassword,
        role: 'officer',
        identifier: 'MH-LM-2041',
        roleLabel: 'Legal Metrology Officer',
        zone: 'Zone II (Mumbai Central)',
        phone: '+91 98200 11223'
      });
      console.log('🌱 Seeded Officer user account.');
    }

    if (!ownerUser) {
      ownerUser = await User.create({
        name: 'Apex Weighing Admin',
        email: 'owner@apexscale.in',
        password: defaultPassword,
        role: 'owner',
        identifier: 'owner@apexscale.in',
        roleLabel: 'Trader / Enterprise Owner',
        enterpriseName: 'Apex Scale Solutions',
        enterpriseType: 'Private Limited Enterprise',
        licenseNo: 'LMPC-MH-2024-8891',
        zone: 'Zone II (Mumbai Central)',
        phone: '+91 98201 44556'
      });
      console.log('🌱 Seeded Owner user account.');
    }

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Director K. Srinivasan',
        email: 'admin@legalmetrology.gov.in',
        password: defaultPassword,
        role: 'administrator',
        identifier: 'admin@legalmetrology.gov.in',
        roleLabel: 'System Administrator',
        zone: 'State HQ',
        phone: '+91 98202 77889'
      });
      console.log('🌱 Seeded Admin user account.');
    }

    if (!gatcUser) {
      gatcUser = await User.create({
        name: 'GATC Central Calibration Lab',
        email: 'lab@mumbaigatc.gov.in',
        password: defaultPassword,
        role: 'gatc',
        identifier: 'GATC-MH-001',
        roleLabel: 'Government Approved Test Centre',
        zone: 'Zone II (Mumbai Central)',
        phone: '+91 98203 11990'
      });
      console.log('🌱 Seeded GATC user account.');
    }

    // 2. Seed Instruments
    const instCount = await InstrumentModel.countDocuments();
    let sampleInst = null;
    if (instCount === 0) {
      sampleInst = await InstrumentModel.create({
        instrumentId: 'INST-SCALE-001',
        type: 'Electronic Heavy Weighbridge 50T',
        category: 'electronic_scales_weighbridges',
        serialNo: 'XYZ123',
        ownerName: ownerUser.enterpriseName || ownerUser.name,
        owner: ownerUser._id,
        manufacturer: 'Essae-Teraoka Precision Instruments',
        model: 'DS-215 Electronic Precision Series',
        capacity: '30 kg',
        status: 'Compliant',
        lastVerified: '05/09/2026',
        nextVerificationDue: '05/09/2027',
        location: 'Plot 18, MIDC Industrial Area, Mumbai',
        accuracyClass: 'Class III',
        qrHash: 'QR-INST-XYZ123'
      });

      await InstrumentModel.create({
        instrumentId: 'INST-WM-8891',
        type: 'M1 Cast Iron Working Standards 20kg',
        category: 'weights_and_measures',
        serialNo: 'XYZ456',
        ownerName: ownerUser.enterpriseName || ownerUser.name,
        owner: ownerUser._id,
        manufacturer: 'Premier Standard Weights Works',
        model: 'M1 Hexagonal Cast Iron',
        capacity: '20 kg',
        status: 'Compliant',
        lastVerified: '15/03/2025',
        nextVerificationDue: '15/03/2027',
        location: 'APMC Market Yard, New Delhi',
        accuracyClass: 'Class M1',
        qrHash: 'QR-INST-XYZ456'
      });
      console.log('🌱 Seeded Registered Devices with relational Owner refs.');
    } else {
      sampleInst = await InstrumentModel.findOne({ serialNo: 'XYZ123' });
    }

    // 3. Seed Applications
    const appCount = await Application.countDocuments();
    let sampleApp = null;
    if (appCount === 0) {
      sampleApp = await Application.create({
        appNo: 'IN-MH-2026-APP-8821',
        date: '2026-09-05',
        time: '10:30 AM',
        owner: ownerUser._id,
        instrument: sampleInst?._id,
        enterpriseName: 'Apex Weighing & Retail Solutions Ltd.',
        enterpriseType: 'Commercial Enterprise',
        equipmentName: 'Electronic Weighing Scale (30kg)',
        equipmentSerial: 'XYZ123',
        equipmentClass: 'Class III',
        instrumentType: 'electronic_scales_weighbridges',
        manufacturer: 'Essae-Teraoka Precision Instruments',
        model: 'DS-215 Electronic Precision Series',
        capacity: '30 kg',
        verificationType: 'periodic',
        installationAddress: 'Plot 18, MIDC Industrial Area, Mumbai',
        jurisdiction: 'District Inspectorate Office',
        zone: 'Zone II (Mumbai Central)',
        status: 'ASSIGNED',
        stage: 'assign_lmo',
        stageLabel: 'Officer Assigned',
        stageBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        assignedLmoUser: officerUser._id,
        assignedLmo: {
          id: officerUser._id.toString(),
          name: officerUser.name,
          badgeNo: officerUser.identifier || 'MH-LM-2041',
          avatar: '',
          phone: officerUser.phone || '+91 98200 11223',
          zone: 'Zone II (Mumbai Central)'
        },
        feeAmount: '₹ 1,850.00',
        paymentStatus: 'Paid',
        statusHistory: [
          {
            status: 'SUBMITTED',
            timestamp: new Date(Date.now() - 86400000 * 2),
            updatedBy: ownerUser._id,
            updatedByName: ownerUser.name,
            notes: 'Verification application submitted.'
          },
          {
            status: 'ASSIGNED',
            timestamp: new Date(Date.now() - 86400000),
            updatedBy: adminUser._id,
            updatedByName: adminUser.name,
            notes: 'Assigned to Inspector Rajesh Sharma for statutory verification.'
          }
        ]
      });
      console.log('🌱 Seeded Applications with relational refs.');
    } else {
      sampleApp = await Application.findOne({ appNo: 'IN-MH-2026-APP-8821' });
    }

    // 4. Seed Certificates
    const certCount = await Certificate.countDocuments();
    if (certCount === 0) {
      await Certificate.create({
        certificateId: 'LM-CERT-2026-0001',
        instrumentId: 'INST-SCALE-001',
        owner: 'Apex Weighing & Retail Solutions Ltd.',
        manufacturer: 'Essae-Teraoka Precision Instruments',
        model: 'DS-215 Electronic Precision Series',
        serialNumber: 'XYZ123',
        accuracyClass: 'Class III',
        capacity: '30 kg',
        verificationDate: '05/09/2026',
        validityPeriod: '12 months',
        expiryDate: '05/09/2027',
        lmoId: officerUser.identifier || 'MH-LM-2041',
        status: 'valid',
        instrument: 'Electronic Weighing Scale',
        category: 'electronic_scales_weighbridges',
        warningThresholdDays: 30,
        daysRemaining: 365,
        verifiedBy: officerUser.name,
        establishmentAddress: 'Plot 18, MIDC Industrial Area, Mumbai',
        eInterval: '5 g',
        digitalSignatureHash: 'ed25519:e8b39a4f21d4c9f7a602bb147814cb9f67a21190bc281e4b308e2f8910d6e8b4',
        ownerRef: ownerUser._id,
        instrumentRef: sampleInst?._id,
        applicationRef: sampleApp?._id,
        lmoRef: officerUser._id
      });
      console.log('🌱 Seeded Certificates with relational ObjectIds.');
    }

    // Seed and sync LMO Roster, GATC, Stakeholders, Alerts
    for (const off of INITIAL_LMOS) {
      await LmoOfficerModel.updateOne(
        { badgeNo: off.badgeNo },
        { $setOnInsert: off },
        { upsert: true }
      );
    }
    if ((await GatcCentreModel.countDocuments()) === 0) {
      await GatcCentreModel.insertMany(INITIAL_GATC_CENTRES);
    }
    if ((await StakeholderModel.countDocuments()) === 0) {
      await StakeholderModel.insertMany(INITIAL_OWNER_REGISTRATIONS);
    }
    if ((await AlertModel.countDocuments()) === 0) {
      await AlertModel.insertMany(INITIAL_ALERTS);
    }

  } catch (error: any) {
    console.warn('⚠️ Database seeding warning:', error?.message || error);
  }
}
