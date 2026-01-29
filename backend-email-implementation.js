// Backend implementation for transactional email sending
// Add this to your backend /api/orders/create endpoint

const nodemailer = require('nodemailer');

// Email transporter configuration using Render environment variables
const createEmailTransporter = () => {
  // Try Gmail SMTP first (primary)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Helps with some SMTP servers
      }
    });
  }
  
  // Fallback to Resend if available
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    return new Resend(process.env.RESEND_API_KEY);
  }
  
  throw new Error('No email configuration found. Please set up Gmail SMTP or Resend environment variables.');
};

// Generate order receipt HTML email template
const generateOrderEmailTemplate = (orderData) => {
  const {
    orderId,
    customerName,
    customerEmail,
    billingDetails,
    orderItems,
    subtotal,
    tax,
    discount,
    shipping,
    total,
    paymentMethod,
    paymentReference,
    shopLocation,
    pickupDetails,
    createdAt
  } = orderData;

  const formatDate = (date) => new Date(date).toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Wine Cellar</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #722f37 0%, #8b3a46 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .order-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #722f37; }
        .section { margin: 25px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #722f37; margin-bottom: 15px; border-bottom: 2px solid #722f37; padding-bottom: 5px; }
        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .item-header { font-weight: bold; background: #f5f5f5; }
        .total-row { font-weight: bold; font-size: 16px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #722f37; }
        .pickup-info { background: #e8f4f8; padding: 15px; border-radius: 6px; border-left: 4px solid #17a2b8; }
        .payment-info { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .highlight { color: #722f37; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🍷 Wine Cellar</div>
        <div>Order Confirmation</div>
      </div>
      
      <div class="content">
        <div class="order-info">
          <h2>Thank you for your order, ${customerName}!</h2>
          <p><strong>Order Number:</strong> <span class="highlight">${orderId}</span></p>
          <p><strong>Order Date:</strong> ${formatDate(createdAt)}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <div class="item-row item-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Size</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          ${orderItems.map(item => `
            <div class="item-row">
              <span>${item.name}</span>
              <span>${item.quantity}</span>
              <span>${item.size || 'N/A'}</span>
              <span>£${item.price.toFixed(2)}</span>
              <span>£${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Order Summary</div>
          <div class="item-row">
            <span>Subtotal:</span>
            <span>£${subtotal.toFixed(2)}</span>
          </div>
          ${discount > 0 ? `
            <div class="item-row">
              <span>Discount:</span>
              <span>-£${discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item-row">
            <span>VAT (20%):</span>
            <span>£${tax.toFixed(2)}</span>
          </div>
          <div class="item-row">
            <span>Shipping:</span>
            <span>£${shipping.toFixed(2)}</span>
          </div>
          <div class="item-row total-row">
            <span>Total Paid:</span>
            <span class="highlight">£${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Billing Information</div>
          <p>
            ${billingDetails.firstName} ${billingDetails.lastName}<br>
            ${billingDetails.address}<br>
            ${billingDetails.postcode}<br>
            ${billingDetails.phone}<br>
            ${billingDetails.email}
          </p>
        </div>

        ${pickupDetails ? `
          <div class="section">
            <div class="section-title">Pickup Location</div>
            <div class="pickup-info">
              <strong>${pickupDetails.name}</strong><br>
              ${pickupDetails.line1}<br>
              ${pickupDetails.city}, ${pickupDetails.postcode}<br>
              ${pickupDetails.country}<br>
              ${pickupDetails.phone}
            </div>
          </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Payment Information</div>
          <div class="payment-info">
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            ${paymentReference ? `<p><strong>Transaction ID:</strong> ${paymentReference}</p>` : ''}
            <p><strong>Shop Location:</strong> ${shopLocation}</p>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing Wine Cellar! If you have any questions about your order, please contact us at:</p>
          <p><strong>Email:</strong> winecellarcustomerservice@gmail.com | <strong>Phone:</strong> +44 20 7123 4567</p>
          <p>Wine Cellar - Premium Wines & Spirits</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send transactional email function
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const transporter = createEmailTransporter();
    
    const emailHtml = generateOrderEmailTemplate(orderData);
    const emailText = `
      Order Confirmation - Wine Cellar
      
      Order Number: ${orderData.orderId}
      Customer: ${orderData.customerName}
      Email: ${orderData.customerEmail}
      
      Order Items:
      ${orderData.orderItems.map(item => 
        `${item.name} - Qty: ${item.quantity} - Size: ${item.size || 'N/A'} - £${item.price.toFixed(2)} each`
      ).join('\n')}
      
      Subtotal: £${orderData.subtotal.toFixed(2)}
      ${orderData.discount > 0 ? `Discount: -£${orderData.discount.toFixed(2)}\n` : ''}
      VAT: £${orderData.tax.toFixed(2)}
      Shipping: £${orderData.shipping.toFixed(2)}
      Total: £${orderData.total.toFixed(2)}
      
      Payment Method: ${orderData.paymentMethod}
      ${orderData.paymentReference ? `Transaction ID: ${orderData.paymentReference}` : ''}
      Shop Location: ${orderData.shopLocation}
      
      ${orderData.pickupDetails ? `
      Pickup Location:
      ${orderData.pickupDetails.name}
      ${orderData.pickupDetails.line1}
      ${orderData.pickupDetails.city}, ${orderData.pickupDetails.postcode}
      ${orderData.pickupDetails.country}
      ${orderData.pickupDetails.phone}
      ` : ''}
      
      Billing Information:
      ${orderData.billingDetails.firstName} ${orderData.billingDetails.lastName}
      ${orderData.billingDetails.address}
      ${orderData.billingDetails.postcode}
      ${orderData.billingDetails.phone}
      ${orderData.billingDetails.email}
      
      Thank you for choosing Wine Cellar!
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Wine Cellar <winecellarcustomerservice@gmail.com>',
      to: orderData.customerEmail,
      subject: `Thank you for placing an order - Wine Cellar Order #${orderData.orderId}`,
      html: emailHtml,
      text: emailText
    };

    let result;
    
    // Send via Gmail SMTP (nodemailer)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      result = await transporter.sendMail(mailOptions);
      console.log('Email sent via Gmail SMTP:', result.messageId);
      return { success: true, messageId: result.messageId, provider: 'gmail-smtp' };
    }
    
    // Send via Resend
    if (process.env.RESEND_API_KEY) {
      result = await transporter.emails.send({
        from: process.env.EMAIL_FROM || 'Wine Cellar <winecellarcustomerservice@gmail.com>',
        to: [orderData.customerEmail],
        subject: mailOptions.subject,
        html: emailHtml,
        text: emailText
      });
      console.log('Email sent via Resend:', result.data);
      return { success: true, messageId: result.data.id, provider: 'resend' };
    }
    
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Example usage in your /api/orders/create endpoint:
/*
router.post('/create', async (req, res) => {
  try {
    // ... your existing order creation logic ...
    
    const orderData = {
      orderId: newOrder.id,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      billingDetails: req.body.billingDetails,
      orderItems: req.body.orderItems,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      discount: req.body.discount || 0,
      shipping: req.body.shipping || 0,
      total: req.body.total,
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference,
      shopLocation: req.body.shopLocation,
      pickupDetails: req.body.pickupDetails,
      createdAt: new Date()
    };
    
    // Send transactional email
    const emailResult = await sendOrderConfirmationEmail(orderData);
    
    // Return order response with email status
    res.json({
      orderId: orderData.orderId,
      emailSent: emailResult.success,
      emailMessageId: emailResult.messageId,
      emailProvider: emailResult.provider,
      emailError: emailResult.error || null
    });
    
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      emailSent: false,
      emailError: error.message 
    });
  }
});
*/

module.exports = {
  sendOrderConfirmationEmail,
  createEmailTransporter,
  generateOrderEmailTemplate
};
