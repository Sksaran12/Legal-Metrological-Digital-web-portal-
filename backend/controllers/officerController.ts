import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { LmoOfficerModel } from '../models/LmoOfficer';
import { secureReference } from '../utils/identifiers';
import { User } from '../models/User';

export async function getAllOfficers(req: Request, res: Response) {
  try {
    const { zone, status } = req.query;
    const filter: any = {};
    if (zone && typeof zone === 'string') filter.zone = zone;
    if (status && typeof status === 'string') filter.status = status;

    const officers = await LmoOfficerModel.find(filter).sort({ name: 1 });
    const formatted = officers.map((o: any) => ({
      ...o.toObject(),
      id: o._id.toString()
    }));
    return res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch officers.' });
  }
}

export async function createOfficer(req: Request, res: Response) {
  try {
    const data = req.body;
    const cleanEmail = String(data.email || '').toLowerCase().trim();
    if (!cleanEmail || typeof data.password !== 'string' || data.password.length < 12) {
      return res.status(400).json({
        success: false,
        message: 'A valid officer email and a password of at least 12 characters are required.'
      });
    }
    if (!data.badgeNo) {
      data.badgeNo = secureReference('MH-LM');
    }

    const existing = await LmoOfficerModel.findOne({ badgeNo: data.badgeNo });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Badge number already exists.' });
    }

    // Bi-directional sync: ensure corresponding User document is created for Auth / Login
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser && !['officer', 'lmo'].includes(existingUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered to a non-officer account.'
      });
    }

    const officer = new LmoOfficerModel({ ...data, email: cleanEmail });
    await officer.save();

    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      await User.create({
        name: officer.name,
        email: cleanEmail,
        password: hashedPassword,
        role: 'officer',
        identifier: officer.badgeNo,
        roleLabel: 'Legal Metrology Officer',
        phone: officer.phone,
        zone: officer.zone || officer.zoneCode,
        status: 'active'
      });
    } else if (existingUser.identifier !== officer.badgeNo) {
      existingUser.identifier = officer.badgeNo;
      existingUser.role = 'officer';
      existingUser.status = 'active';
      await existingUser.save();
      }

    return res.status(201).json({ success: true, message: 'Officer added to roster and authentication account created.', data: officer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create officer.' });
  }
}

export async function updateOfficer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await LmoOfficerModel.findOneAndUpdate(
      { $or: [{ _id: id }, { badgeNo: id }] },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Officer not found.' });
    }

    // Also update User record if present
    if (updated.email) {
      const userUpdate: any = {};
      if (req.body.name) userUpdate.name = req.body.name;
      if (req.body.phone) userUpdate.phone = req.body.phone;
      if (req.body.zone) userUpdate.zone = req.body.zone;
      if (req.body.badgeNo) userUpdate.identifier = req.body.badgeNo;

      if (Object.keys(userUpdate).length > 0) {
        await User.findOneAndUpdate(
          { email: updated.email.toLowerCase() },
          userUpdate
        );
      }
    }

    return res.status(200).json({ success: true, message: 'Officer updated.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update officer.' });
  }
}
