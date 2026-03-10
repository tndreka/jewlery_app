import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = env.email.host
  ? nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: { user: env.email.user, pass: env.email.pass },
    })
  : null;

export async function sendOrderConfirmation(order: {
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  items: { product_name: string; quantity: number; unit_price: number }[];
}) {
  if (!transporter) {
    console.log('Email not configured, skipping order confirmation email');
    return;
  }

  const itemRows = order.items
    .map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${i.unit_price}</td></tr>`)
    .join('');

  await transporter.sendMail({
    from: env.email.from,
    to: order.customer_email,
    subject: `Order Confirmed — ${order.order_number} | Argjendari Kadriu`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
        <h1 style="font-size:24px;font-weight:300;text-align:center;letter-spacing:0.1em">ARGJENDARI KADRIU</h1>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0" />
        <p>Dear ${order.customer_name},</p>
        <p>Thank you for your order. Here are your order details:</p>
        <p style="font-size:18px;font-weight:500">Order #${order.order_number}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#f9f9f6"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="font-size:16px;text-align:right"><strong>Total: $${order.total}</strong></p>
        <p>We'll notify you when your order ships.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0" />
        <p style="font-size:12px;color:#999;text-align:center">Argjendari Kadriu — Fine Gold Jewelry</p>
      </div>
    `,
  });
}

export async function sendShippingNotification(order: {
  customer_email: string;
  customer_name: string;
  order_number: string;
  tracking_number: string;
}) {
  if (!transporter) return;

  await transporter.sendMail({
    from: env.email.from,
    to: order.customer_email,
    subject: `Your Order Has Shipped — ${order.order_number} | Argjendari Kadriu`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
        <h1 style="font-size:24px;font-weight:300;text-align:center;letter-spacing:0.1em">ARGJENDARI KADRIU</h1>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0" />
        <p>Dear ${order.customer_name},</p>
        <p>Your order <strong>#${order.order_number}</strong> has been shipped!</p>
        <p>Tracking number: <strong>${order.tracking_number}</strong></p>
        <p>Thank you for shopping with us.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0" />
        <p style="font-size:12px;color:#999;text-align:center">Argjendari Kadriu — Fine Gold Jewelry</p>
      </div>
    `,
  });
}
