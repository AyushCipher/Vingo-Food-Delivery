import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Disable debug logging to reduce console clutter
  // debug: true,
  // logger: true
});

// Verify transporter on startup (optional - can be commented out if causing issues)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});


export const sendMail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Vingo Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔐 Reset Your Vingo Password – OTP Verification",

    html: `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding: 30px;">
      <div style="max-width: 500px; margin:auto; background:#ffffff;
                  border-radius:10px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.08)">
        
        <h2 style="color:#ff4d2d; text-align:center; margin-bottom:10px;">
          Vingo Password Reset
        </h2>

        <p style="text-align:center; color:#555; font-size:14px;">
          Use the One-Time Password (OTP) below to reset your account password.
        </p>

        <div style="text-align:center; margin:25px 0;">
          <div style="display:inline-block; 
                      padding:14px 28px; 
                      font-size:28px; 
                      font-weight:bold; 
                      color:#ffffff; 
                      background:#ff4d2d; 
                      border-radius:8px; 
                      letter-spacing:3px;">
            ${otp}
          </div>
        </div>

        <p style="color:#555; font-size:14px;">
          This OTP is valid for <strong>5 minutes</strong>. 
          Please do not share it with anyone for security reasons.
        </p>

        <p style="color:#777; font-size:12px; margin-top:18px;">
          If you did not request this password reset, please ignore this email or contact our support team.
        </p>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        
        <p style="text-align:center; color:#999; font-size:12px;">
          © 2025 Vingo • Your trusted food delivery partner 🍽️
        </p>
      </div>
    </div>
    `
  });
};


export const sendOtpToUser = async (user, otp) => {
  console.log(`📧 Attempting to send OTP to: ${user.email}`);
  
  const info = await transporter.sendMail({
    from: `"Vingo Orders" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "🛵 Vingo Delivery OTP",

    html: `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding: 30px;">
      <div style="max-width: 500px; margin:auto; background:#ffffff;
                  border-radius:10px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.08)">
        
        <h2 style="color:#ff4d2d; text-align:center; margin-bottom:10px;">
          Delivery Verification OTP
        </h2>

        <p style="text-align:center; color:#555; font-size:14px;">
          Share this OTP with your delivery partner to confirm your order.
        </p>

        <div style="text-align:center; margin:25px 0;">
          <div style="display:inline-block; 
                      padding:14px 28px; 
                      font-size:28px; 
                      font-weight:bold; 
                      color:#ffffff; 
                      background:#ff4d2d; 
                      border-radius:8px; 
                      letter-spacing:3px;">
            ${otp}
          </div>
        </div>

        <p style="color:#777; font-size:12px;">
          Do not share this OTP with anyone except your delivery partner.
        </p>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        
        <p style="text-align:center; color:#999; font-size:12px;">
          Thank you for choosing Vingo 🍕
        </p>
      </div>
    </div>
    `
  });
  
  console.log(`✅ OTP email sent successfully. Message ID: ${info.messageId}`);
  return info;
};


export const sendOrderConfirmationToCustomer = async (user, order) => {
  console.log(`📧 Sending order confirmation to customer: ${user.email}`);
  
  const orderItemsHtml = order.shopOrders.map(shopOrder => {
    const itemsList = shopOrder.items.map(item => 
      `<li style="padding:5px 0; color:#555;">${item.quantity}x ${item.name} - ₹${item.price * item.quantity}</li>`
    ).join('');
    
    return `
      <div style="margin-bottom:15px; padding:15px; background:#f9f9f9; border-radius:8px;">
        <h3 style="color:#ff4d2d; margin-bottom:10px; font-size:16px;">${shopOrder.shop.name || 'Shop'}</h3>
        <ul style="list-style:none; padding:0; margin:0;">
          ${itemsList}
        </ul>
        <p style="font-weight:bold; color:#333; margin-top:10px;">Subtotal: ₹${shopOrder.subtotal}</p>
      </div>
    `;
  }).join('');

  const info = await transporter.sendMail({
    from: `"Vingo Orders" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "🎉 Order Confirmed - Vingo",

    html: `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding: 30px;">
      <div style="max-width: 600px; margin:auto; background:#ffffff;
                  border-radius:10px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.08)">
        
        <h2 style="color:#ff4d2d; text-align:center; margin-bottom:10px;">
          Order Confirmed! 🎉
        </h2>

        <p style="text-align:center; color:#555; font-size:14px; margin-bottom:20px;">
          Hi <strong>${user.fullName}</strong>, your order has been placed successfully!
        </p>

        <div style="background:#fff3f0; padding:15px; border-radius:8px; margin-bottom:20px;">
          <p style="margin:5px 0; color:#333;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          <p style="margin:5px 0; color:#333;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p style="margin:5px 0; color:#333;"><strong>Delivery Address:</strong> ${order.address.text}</p>
        </div>

        <h3 style="color:#333; margin-top:20px; margin-bottom:15px;">Order Details:</h3>
        ${orderItemsHtml}

        <div style="text-align:right; padding:15px; background:#ff4d2d; color:white; border-radius:8px; margin-top:20px;">
          <p style="margin:0; font-size:18px;"><strong>Total Amount: ₹${order.totalAmount}</strong></p>
        </div>

        <p style="color:#555; font-size:14px; margin-top:20px; text-align:center;">
          Your order is being prepared. You'll receive updates as it progresses.
        </p>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        
        <p style="text-align:center; color:#999; font-size:12px;">
          Thank you for choosing Vingo! 🍕
        </p>
      </div>
    </div>
    `
  });
  
  console.log(`✅ Order confirmation email sent. Message ID: ${info.messageId}`);
  return info;
};


export const sendOrderNotificationToOwner = async (owner, order, shopOrder) => {
  console.log(`📧 Sending order notification to shop owner: ${owner.email}`);
  
  const itemsList = shopOrder.items.map(item => 
    `<li style="padding:5px 0; color:#555;">${item.quantity}x ${item.name} - ₹${item.price * item.quantity}</li>`
  ).join('');

  const info = await transporter.sendMail({
    from: `"Vingo Orders" <${process.env.EMAIL_USER}>`,
    to: owner.email,
    subject: "🔔 New Order Received - Vingo",

    html: `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding: 30px;">
      <div style="max-width: 600px; margin:auto; background:#ffffff;
                  border-radius:10px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.08)">
        
        <h2 style="color:#ff4d2d; text-align:center; margin-bottom:10px;">
          New Order Received! 🔔
        </h2>

        <p style="text-align:center; color:#555; font-size:14px; margin-bottom:20px;">
          You have a new order for your shop!
        </p>

        <div style="background:#fff3f0; padding:15px; border-radius:8px; margin-bottom:20px;">
          <p style="margin:5px 0; color:#333;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          <p style="margin:5px 0; color:#333;"><strong>Customer:</strong> ${order.user.fullName}</p>
          <p style="margin:5px 0; color:#333;"><strong>Phone:</strong> ${order.user.mobile || 'N/A'}</p>
          <p style="margin:5px 0; color:#333;"><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p style="margin:5px 0; color:#333;"><strong>Delivery Address:</strong> ${order.address.text}</p>
        </div>

        <h3 style="color:#333; margin-top:20px; margin-bottom:15px;">Order Items:</h3>
        <div style="padding:15px; background:#f9f9f9; border-radius:8px;">
          <ul style="list-style:none; padding:0; margin:0;">
            ${itemsList}
          </ul>
          <p style="font-weight:bold; color:#ff4d2d; margin-top:15px; font-size:18px;">Order Total: ₹${shopOrder.subtotal}</p>
        </div>

        <div style="text-align:center; margin-top:25px;">
          <p style="color:#555; font-size:14px;">
            Please prepare this order and update the status in your dashboard.
          </p>
        </div>

        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        
        <p style="text-align:center; color:#999; font-size:12px;">
          Vingo - Grow your business 🚀
        </p>
      </div>
    </div>
    `
  });
  
  console.log(`✅ Owner notification email sent. Message ID: ${info.messageId}`);
  return info;
};

