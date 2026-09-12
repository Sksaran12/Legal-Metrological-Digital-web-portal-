import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { LmoOfficerModel } from '../models/LmoOfficer';
import { StakeholderModel } from '../models/Stakeholder';
import { secureReference } from '../utils/identifiers';
import { AuthRequest } from '../middleware/auth';
import { getAppConfig } from '../config/env';

const getJwtSecret = () => {
  return getAppConfig().jwtSecret;
};
const getJwtExpiresIn = () => getAppConfig().jwtExpiresIn;

function setAuthCookie(res: Response, token: string, maxAge: number) {
  const config = getAppConfig();
  res.setHeader(
    'Set-Cookie',
    `everimet_auth=${encodeURIComponent(token)}; Max-Age=${Math.floor(maxAge / 1000)}; Path=/; HttpOnly; SameSite=None${config.isProduction ? '; Secure' : ''}`
  );
}

export async function register(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      password,
      role = 'owner',
      phone,
      state
    } = req.body;

    const selfRegisterableRoles: UserRole[] = [
      'owner',
      'business',
      'manufacturer',
      'dealer',
      'repairer',
      'importer',
      'citizen',
      'administrator',
      'officer'
    ];
    if (!selfRegisterableRoles.includes(role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: 'This role must be provisioned by an administrator.'
      });
    }

    let { enterpriseName, enterpriseType, gstin, licenseNo, zone } = req.body;

    if (!enterpriseName) {
      enterpriseName = `${name} Enterprise & Scales Ltd.`;
    }
    if (!licenseNo) {
      licenseNo = secureReference('LMPC-MH') + '-REG';
    }
    if (!gstin) {
      gstin = '27AAAAA0000A1Z5';
    }
    if (!zone) {
      zone = state || 'Zone II (Mumbai Central)';
    }
    if (!enterpriseType) {
      enterpriseType = role === 'manufacturer' ? 'Manufacturer' : role === 'importer' ? 'Importer' : 'Trader / Retailer';
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const roleLabels: Partial<Record<UserRole, string>> = {
      officer: 'Legal Metrology Officer',
      owner: 'Trader / Enterprise Owner',
      administrator: 'System Administrator',
      business: 'Trader / Enterprise Owner',
      citizen: 'Registered Citizen',
      manufacturer: 'Licensed Manufacturer',
      dealer: 'Licensed Dealer',
      repairer: 'Licensed Repairer',
      importer: 'Registered Importer',
      lmo: 'Legal Metrology Officer',
      gatc: 'GATC Testing Laboratory'
    };

    const identifier =
      role === 'officer'
        ? secureReference('MH-LM')
        : email;

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      identifier,
      roleLabel: roleLabels[role as UserRole] || 'User',
      phone,
      enterpriseName,
      enterpriseType,
      gstin,
      licenseNo,
      zone,
      status: 'active'
    });

    await newUser.save();

    if (role === 'officer' || role === 'lmo') {
      try {
        const existingOfficer = await LmoOfficerModel.findOne({
          $or: [{ email: email.toLowerCase() }, { badgeNo: identifier }]
        });
        if (!existingOfficer) {
          await LmoOfficerModel.create({
            badgeNo: identifier,
            name,
            email: email.toLowerCase(),
            phone: phone || '+91 98200 00000',
            zone: zone || 'Zone II (Mumbai Central)',
            zoneCode: zone ? (zone.startsWith('Zone') ? zone : `Zone - ${zone}`) : 'Zone II (Mumbai Central)',
            status: 'Available',
            statusClass: 'bg-emerald-500/20 text-emerald-400',
            inspectionsToday: 0,
            completedThisMonth: 0,
            stampingCertsIssued: 0,
            avatar: name ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'LM',
            currentLocation: zone || 'Zone II (Mumbai Central)'
          });
        }
      } catch (officerSyncError) {
        console.error('Error syncing officer into roster model during registration:', officerSyncError);
      }
    }

    if (['owner', 'business', 'manufacturer', 'dealer', 'repairer', 'importer'].includes(role)) {
      try {
        const existingStakeholder = await StakeholderModel.findOne({
          $or: [{ contactEmail: email.toLowerCase() }, { licenseNo: newUser.licenseNo }]
        });
        if (!existingStakeholder) {
          const entType =
            role === 'manufacturer'
              ? 'Manufacturer'
              : role === 'importer'
              ? 'Importer'
              : role === 'repairer'
              ? 'Repairer'
              : 'Trader / Retailer';

          await StakeholderModel.create({
            registrationNo: secureReference('REG-MH'),
            enterpriseName: newUser.enterpriseName || `${name} Enterprise`,
            ownerName: name,
            enterpriseType: entType,
            licenseNo: newUser.licenseNo,
            zone: zone || 'Zone II (Mumbai Central)',
            registeredDevices: 0,
            complianceScore: 100,
            status: 'Active',
            contactPhone: phone || '+91 98201 00000',
            contactEmail: email.toLowerCase()
          });
        }
      } catch (stkErr) {
        console.error('Error syncing stakeholder record on registration:', stkErr);
      }
    }

    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        enterpriseName: newUser.enterpriseName
      },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() as any }
    );
    setAuthCookie(res, token, 15 * 60 * 1000);

    return res.status(201).json({
      success: true,
      message: 'Registration completed successfully.',
      userSession: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        identifier: newUser.identifier,
        roleLabel: newUser.roleLabel,
        enterpriseName: newUser.enterpriseName,
        enterpriseType: newUser.enterpriseType,
        gstin: newUser.gstin,
        licenseNo: newUser.licenseNo,
        zone: newUser.zone,
        phone: newUser.phone
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed.',
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Older administrator records may predate the status field. Normalize
    // those records instead of locking the administrator out of the portal.
    if (user.role === 'administrator' && !user.status) {
      user.status = 'active';
      await user.save();
    }

    if ((user.role === 'administrator' || user.role === 'officer' || user.role === 'lmo') && user.status === 'pending') {
      user.status = 'active';
      await user.save();
    }

    if (user.status !== 'active' || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account is not available for login.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Role boundary protection: prevent owner or officer from signing into administrator command center, and vice-versa
    if (role && user.role) {
      const isReqAdmin = role === 'administrator' || (role as string) === 'admin';
      const isUserAdmin = user.role === 'administrator' || (user.role as string) === 'admin';
      const isReqOwner = role === 'owner' || role === 'business';
      const isUserOwner = user.role === 'owner' || user.role === 'business' || ['manufacturer', 'dealer', 'repairer', 'importer'].includes(user.role);
      const isReqOfficer = role === 'officer' || (role as string) === 'lmo';
      const isUserOfficer = user.role === 'officer' || (user.role as string) === 'lmo';

      if (isReqAdmin && !isUserAdmin) {
        return res.status(403).json({
          success: false,
          message: `Access denied. '${cleanEmail}' is registered as '${user.roleLabel || user.role}'. Please select your corresponding designation in the login dropdown.`
        });
      }

      if (isReqOwner && !isUserOwner) {
        return res.status(403).json({
          success: false,
          message: `Access denied. '${cleanEmail}' is registered as '${user.roleLabel || user.role}'. Please select '${user.role}' in the designation dropdown.`
        });
      }

      if (isReqOfficer && !isUserOfficer) {
        return res.status(403).json({
          success: false,
          message: `Access denied. '${cleanEmail}' is registered as '${user.roleLabel || user.role}'. Please select '${user.role}' in the designation dropdown.`
        });
      }
    }

    // Normalized active role
    let activeRole = (role || user.role) as UserRole;
    if (activeRole === ('admin' as any)) activeRole = 'administrator';
    if (user.role === ('admin' as any)) activeRole = 'administrator';

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: activeRole,
        name: user.name,
        identifier: user.identifier,
        zone: user.zone,
        enterpriseName: user.enterpriseName
      },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() as any }
    );
    setAuthCookie(res, token, 15 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      userSession: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: activeRole,
        identifier: user.identifier,
        roleLabel: user.roleLabel,
        enterpriseName: user.enterpriseName,
        enterpriseType: user.enterpriseType,
        gstin: user.gstin,
        licenseNo: user.licenseNo,
        zone: user.zone,
        phone: user.phone
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Login processing error.',
    });
  }
}

export function logout(_req: Request, res: Response) {
  const config = getAppConfig();
  res.setHeader(
    'Set-Cookie',
    `everimet_auth=; Max-Age=0; Path=/; HttpOnly; SameSite=None${config.isProduction ? '; Secure' : ''}`
  );
  return res.status(204).send();
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    let role = user.role;
    if (role === ('admin' as any)) role = 'administrator';

    return res.status(200).json({
      success: true,
      userSession: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role,
        identifier: user.identifier,
        roleLabel: user.roleLabel,
        enterpriseName: user.enterpriseName,
        enterpriseType: user.enterpriseType,
        gstin: user.gstin,
        licenseNo: user.licenseNo,
        zone: user.zone,
        phone: user.phone
      },
      user
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
}
