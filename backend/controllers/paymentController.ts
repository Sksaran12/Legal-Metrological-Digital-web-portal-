import { Request, Response } from 'express';
import crypto from 'crypto';
import { getAppConfig } from '../config/env';
import { Application } from '../models/Application';
import { Payment } from '../models/Payment';
import { AuthRequest } from '../middleware/auth';
import { isValidHmacSignature } from '../utils/signatures';

function paymentConfig() {
  const config = getAppConfig();
  if ((!config.razorpayKeyId || !config.razorpayKeySecret) && !config.allowDemoPayments) {
    throw Object.assign(new Error('Razorpay is not configured.'), { statusCode: 503 });
  }
  return config;
}

export async function createPaymentOrder(req: AuthRequest, res: Response) {
  try {
    const config = paymentConfig();
    const applicationId = String(req.body.applicationId || '').trim();
    if (!applicationId) return res.status(400).json({ success: false, message: 'An application is required to create a payment order.' });
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (req.user?.role !== 'administrator' && application.owner?.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to pay for this application.' });
    }
    if (application.paymentStatus === 'Paid') return res.status(409).json({ success: false, message: 'This application has already been paid.' });
    const amount = Number(application.grandTotal ?? application.feeAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'The application does not have a valid payable amount.' });
    }
    const receipt = application.appNo.slice(0, 40);

    if (config.allowDemoPayments && (!config.razorpayKeyId || !config.razorpayKeySecret)) {
      const demoOrderId = `order_demo_${crypto.randomBytes(12).toString('hex')}`;
      await Payment.create({
        orderId: demoOrderId, paymentId: `pending-${demoOrderId}`,
        application: application._id, owner: application.owner || req.user?.id,
        amount, currency: 'INR', status: 'created'
      });
      return res.status(201).json({ success: true, data: { orderId: demoOrderId, amount: Math.round(amount * 100), currency: 'INR', keyId: 'demo' } });
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'INR', receipt, payment_capture: 1 })
    });
    const data = await response.json() as { id?: string; amount?: number; currency?: string; error?: { description?: string } };
    if (!response.ok || !data.id) {
      return res.status(502).json({ success: false, message: data.error?.description || 'Razorpay order creation failed.' });
    }
    if (req.user?.id) {
      await Payment.findOneAndUpdate(
        { orderId: data.id },
        { orderId: data.id, paymentId: `pending-${data.id}`, application: application?._id, owner: req.user.id, amount: Number(data.amount) / 100, currency: data.currency || 'INR', status: 'created' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    return res.status(201).json({ success: true, data: { orderId: data.id, amount: data.amount, currency: data.currency, keyId: config.razorpayKeyId } });
  } catch (error) {
    return res.status((error as { statusCode?: number }).statusCode || 500).json({ success: false, message: error instanceof Error ? error.message : 'Payment order creation failed.' });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const config = paymentConfig();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification fields are required.' });
    }
    const isDemoOrder = String(razorpay_order_id).startsWith('order_demo_');
    if (!isDemoOrder && !isValidHmacSignature(`${razorpay_order_id}|${razorpay_payment_id}`, String(razorpay_signature), config.razorpayKeySecret!)) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }
    if (isDemoOrder && !config.allowDemoPayments) {
      return res.status(403).json({ success: false, message: 'Demo payments are disabled.' });
    }

    let order: { amount?: number; currency?: string };
    if (isDemoOrder) {
      const demo = await Payment.findOne({ orderId: String(razorpay_order_id), owner: req.user?.id });
      order = demo ? { amount: Math.round(demo.amount * 100), currency: demo.currency } : {};
    } else {
      const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64')}` }
      });
      order = await orderResponse.json() as { amount?: number; currency?: string };
      if (!orderResponse.ok) return res.status(400).json({ success: false, message: 'Unable to validate the Razorpay order.' });
    }
    if (!order.amount || order.currency !== 'INR') return res.status(400).json({ success: false, message: 'Unable to validate the Razorpay order.' });
    const pendingPayment = await Payment.findOne({ orderId: String(razorpay_order_id), owner: req.user?.id });
    if (!pendingPayment) return res.status(403).json({ success: false, message: 'Payment order does not belong to the authenticated user.' });
    const application = pendingPayment.application ? await Application.findById(pendingPayment.application) : null;
    if (!application || (req.user?.role !== 'administrator' && application.owner?.toString() !== req.user?.id)) {
      return res.status(403).json({ success: false, message: 'Payment is not bound to an accessible application.' });
    }
    if (application.razorpayOrderId && application.razorpayOrderId !== String(razorpay_order_id)) {
      return res.status(409).json({ success: false, message: 'Payment order does not match the application.' });
    }
    const expectedAmount = Number(application.grandTotal ?? application.feeAmount);
    if (!Number.isFinite(expectedAmount) || Math.round(expectedAmount * 100) !== Number(order.amount) ||
        Math.round(pendingPayment.amount * 100) !== Number(order.amount) || pendingPayment.currency !== order.currency) {
      return res.status(400).json({ success: false, message: 'Payment amount does not match the application total.' });
    }
    if (application?.paymentStatus === 'Paid' || await Payment.exists({ paymentId: String(razorpay_payment_id), status: 'verified' })) {
      return res.status(409).json({ success: false, message: 'This payment has already been processed.' });
    }
    let ownerId = application?.owner?.toString() || pendingPayment.owner?.toString() || req.user?.id;
    if (!ownerId) return res.status(400).json({ success: false, message: 'Payment owner could not be resolved.' });
    if (application) {
      application.paymentStatus = 'Paid';
      application.razorpayOrderId = String(razorpay_order_id);
      application.razorpayPaymentId = String(razorpay_payment_id);
      application.txnId = String(razorpay_payment_id);
      application.paymentMethod = 'RAZORPAY';
      if (!application.owner) application.owner = req.user?.id;
      await application.save();
    }
    await Payment.findOneAndUpdate(
      { orderId: String(razorpay_order_id) },
      { orderId: String(razorpay_order_id), paymentId: String(razorpay_payment_id), application: application?._id, owner: ownerId, amount: Number(order.amount) / 100, currency: 'INR', status: 'verified' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, message: 'Payment verified.', data: { paymentId: razorpay_payment_id, amount: Number(order.amount) / 100 } });
  } catch {
    return res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
}

export async function handlePaymentWebhook(req: Request, res: Response) {
  try {
    const config = getAppConfig();
    if (!config.razorpayWebhookSecret) return res.status(503).json({ success: false, message: 'Payment webhook is not configured.' });
    const signature = req.header('x-razorpay-signature') || '';
    const raw = (req as Request & { rawBody?: Buffer }).rawBody || Buffer.from(JSON.stringify(req.body));
    if (!signature || !isValidHmacSignature(raw, signature, config.razorpayWebhookSecret)) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }
    const event = String(req.body?.event || '');
    const paymentEntity = req.body?.payload?.payment?.entity;
    const orderEntity = req.body?.payload?.order?.entity;
    const orderId = String(paymentEntity?.order_id || orderEntity?.id || '');
    const paymentId = String(paymentEntity?.id || '');

    if (event === 'payment.captured' || event === 'order.paid') {
      const storedPayment = orderId ? await Payment.findOne({ orderId }) : null;
      const application = storedPayment?.application ? await Application.findById(storedPayment.application) : null;
      const amount = Number(paymentEntity?.amount || orderEntity?.amount || 0) / 100;
      const currency = String(paymentEntity?.currency || orderEntity?.currency || '');
      if (!storedPayment || !application || currency !== storedPayment.currency ||
          Math.round(amount * 100) !== Math.round(storedPayment.amount * 100)) {
        return res.status(400).json({ success: false, message: 'Webhook payment is not bound to a stored order.' });
      }
      if (storedPayment.status === 'verified' && storedPayment.paymentId === paymentId) return res.json({ success: true });
      if (application) {
        application.paymentStatus = 'Paid';
        application.razorpayOrderId = orderId || application.razorpayOrderId;
        application.razorpayPaymentId = paymentId || application.razorpayPaymentId;
        application.txnId = paymentId || application.txnId;
        application.paymentMethod = 'RAZORPAY';
        await application.save();
        if (application.owner) {
          await Payment.findOneAndUpdate(
            { orderId: orderId || application.razorpayOrderId },
            {
              orderId: orderId || application.razorpayOrderId,
              paymentId: paymentId || application.razorpayPaymentId,
              application: application._id,
              owner: application.owner,
              amount,
              currency,
              status: 'verified'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      }
    } else if (event === 'payment.failed' && (orderId || paymentId)) {
      const storedPayment = orderId ? await Payment.findOne({ orderId }) : null;
      const application = storedPayment?.application ? await Application.findById(storedPayment.application) : null;
      if (!storedPayment || !application) return res.status(400).json({ success: false, message: 'Webhook payment order is not recognized.' });
      if (application && application.paymentStatus !== 'Paid') {
        application.paymentStatus = 'Pending';
        await application.save();
      }
      if (orderId && application.owner) {
        await Payment.findOneAndUpdate(
          { orderId },
          { orderId, paymentId: paymentId || `failed-${orderId}`, application: application._id, owner: application.owner, amount: Number(paymentEntity?.amount || 0) / 100, currency: 'INR', status: 'failed' },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    } else if (event === 'refund.created' && paymentId) {
      const payment = await Payment.findOneAndUpdate({ paymentId }, { status: 'refunded' }, { new: true });
      if (payment?.application) {
        await Application.findByIdAndUpdate(payment.application, { paymentStatus: 'Pending' });
      }
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: 'Payment webhook processing failed.' });
  }
}
