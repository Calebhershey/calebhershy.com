// Email Service for Grazin Acres
// This module handles all email notifications for the farm system

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initPromise = this.setupTransporter();
  }

  async setupTransporter() {
    // Using Gmail with app-specific password for production
    
    // Option 1: Gmail (requires app-specific password)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-farm-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-specific-password'
      }
    });

    // Option 4: For testing - Ethereal Email (fake SMTP)
    // await this.setupTestTransporter();
    // });

    // Option 2: Outlook/Hotmail
    // this.transporter = nodemailer.createTransport({
    //   service: 'hotmail',
    //   auth: {
    //     user: process.env.EMAIL_USER || 'your-farm-email@outlook.com',
    //     pass: process.env.EMAIL_PASSWORD || 'your-password'
    //   }
    // });

    // Option 3: Custom SMTP (recommended for production)
    // this.transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST || 'smtp.yourwebhost.com',
    //   port: process.env.SMTP_PORT || 587,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: process.env.EMAIL_USER || 'noreply@grazinacres.com',
    //     pass: process.env.EMAIL_PASSWORD || 'your-password'
    //   }
    // });
  }

  async setupTestTransporter() {
    // Create a test account for development
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Test email account created:', testAccount.user);
    } catch (error) {
      console.error('Error setting up test transporter:', error);
    }
  }

  // Ensure transporter is ready
  async ensureReady() {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  // Test email connection
  async testEmailConnection() {
    await this.ensureReady();
    try {
      // For Ethereal test accounts, we don't need to verify - just check if transporter exists
      if (this.transporter && this.transporter.options.host === 'smtp.ethereal.email') {
        return {
          success: true,
          message: 'Test email service connected successfully',
          provider: 'ethereal (test)',
          testAccount: this.transporter.options.auth.user
        };
      }
      
      // For real email services, verify the connection
      const verified = await this.transporter.verify();
      return {
        success: true,
        message: 'Email connection verified successfully',
        provider: this.transporter.options.service || this.transporter.options.host || 'unknown'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Email connection failed'
      };
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(orderData) {
    await this.ensureReady();
    try {
      const { customer, email, cart, total, delivery, orderId } = orderData;
      
      let deliveryText = '';
      if (delivery.method === 'home') {
        deliveryText = `<strong>Delivery Address:</strong><br>${delivery.address}`;
      } else if (delivery.method === 'dropsite') {
        const dropsite = delivery.dropsite;
        const schedule = this.formatScheduleText(dropsite.schedule);
        deliveryText = `
          <strong>Pickup Location:</strong><br>
          ${dropsite.name}<br>
          ${dropsite.address}<br><br>
          <strong>Pickup Times:</strong><br>
          ${schedule}<br><br>
          ${dropsite.contactPerson ? `<strong>Contact:</strong> ${dropsite.contactPerson}<br>` : ''}
          ${dropsite.contactPhone ? `<strong>Phone:</strong> ${dropsite.contactPhone}` : ''}
        `;
      }

      const itemsList = cart.map(item => 
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
      ).join('');

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@grazinacres.com',
        to: email,
        subject: `Order Confirmation #${orderId} - Grazin Acres`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2e8b57; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🌱 Grazin Acres</h1>
              <h2 style="margin: 10px 0 0 0;">Order Confirmation</h2>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Dear ${customer},</p>
              <p>Thank you for your order! We've received your order and are preparing it for ${delivery.method === 'home' ? 'delivery' : 'pickup'}.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e8b57; margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> #${orderId}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background: #f8f9fa;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                      <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 10px; font-weight: bold; border-top: 2px solid #2e8b57;">Total:</td>
                      <td style="padding: 10px; font-weight: bold; text-align: right; border-top: 2px solid #2e8b57;">$${total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e8b57; margin-top: 0;">${delivery.method === 'home' ? '🚚 Delivery Information' : '📍 Pickup Information'}</h3>
                ${deliveryText}
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #2e8b57;"><strong>What's Next?</strong></p>
                <ul style="margin: 10px 0; color: #2e8b57;">
                  <li>We'll prepare your fresh, organic products</li>
                  <li>${delivery.method === 'home' ? 'Your order will be delivered to your address' : 'You can pick up your order at the scheduled time'}</li>
                  <li>We'll send you another email when your order is ready</li>
                </ul>
              </div>
              
              <p>If you have any questions about your order, please contact us at <a href="mailto:orders@grazinacres.com">orders@grazinacres.com</a> or call us at (555) 123-FARM.</p>
              
              <p>Thank you for supporting local, sustainable farming!</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Grazin Acres Team</strong>
              </p>
            </div>
            
            <div style="background: #2e8b57; color: white; padding: 15px; text-align: center; font-size: 0.9em;">
              <p style="margin: 0;">Grazin Acres Farm | 123 Farm Road, Farmville, TX 75001</p>
              <p style="margin: 5px 0 0 0;">Visit us at <a href="#" style="color: white;">www.grazinacres.com</a></p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send membership approval notification
  async sendMembershipApproval(userData) {
    await this.ensureReady();
    try {
      const { username, profile, customerGroup } = userData;
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@grazinacres.com',
        to: profile.email,
        subject: 'Welcome to Grazin Acres - Membership Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2e8b57; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🌱 Welcome to Grazin Acres!</h1>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Dear ${profile.firstName} ${profile.lastName},</p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h2 style="color: #2e8b57; margin: 0;">🎉 Your membership has been approved!</h2>
              </div>
              
              <p>We're excited to welcome you to the Grazin Acres family. Your membership application has been reviewed and approved.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e8b57; margin-top: 0;">Your Membership Details</h3>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Customer Group:</strong> ${this.getCustomerGroupLabel(customerGroup)}</p>
                <p><strong>Member Since:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e8b57; margin-top: 0;">What You Can Do Now</h3>
                <ul>
                  <li>Browse our selection of fresh, organic products</li>
                  <li>Place orders for home delivery or dropsite pickup</li>
                  <li>Access exclusive member pricing and seasonal offers</li>
                  <li>Join our community of sustainable farming supporters</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://grazinacres.com/login.html" style="background: #2e8b57; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
              </div>
              
              <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support@grazinacres.com">support@grazinacres.com</a>.</p>
              
              <p>Thank you for choosing Grazin Acres!</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Grazin Acres Team</strong>
              </p>
            </div>
            
            <div style="background: #2e8b57; color: white; padding: 15px; text-align: center; font-size: 0.9em;">
              <p style="margin: 0;">Grazin Acres Farm | 123 Farm Road, Farmville, TX 75001</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Membership approval email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending membership approval email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send admin notification for new membership application
  async sendAdminMembershipNotification(userData) {
    await this.ensureReady();
    try {
      const { username, profile } = userData;
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@grazinacres.com',
        to: process.env.ADMIN_EMAIL || 'admin@grazinacres.com',
        subject: 'New Membership Application - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #ffc107; color: #212529; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">⚠️ New Membership Application</h1>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <p>A new membership application has been submitted and requires your review.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e8b57; margin-top: 0;">Application Details</h3>
                <p><strong>Name:</strong> ${profile.firstName} ${profile.lastName}</p>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Phone:</strong> ${profile.phone || 'Not provided'}</p>
                <p><strong>Member Type:</strong> ${profile.memberType || 'Not specified'}</p>
                <p><strong>Applied:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://grazinacres.com/admin-database.html" style="background: #2e8b57; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Application</a>
              </div>
              
              <p><strong>Action Required:</strong> Please log in to the admin dashboard to review and approve or reject this membership application.</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Admin notification email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(orderData, newStatus) {
    await this.ensureReady();
    try {
      const { customer, email, orderId } = orderData;
      
      const statusMessages = {
        'processing': {
          subject: 'Your Order is Being Prepared',
          message: 'Great news! We\'ve started preparing your fresh, organic products.',
          color: '#007bff'
        },
        'ready': {
          subject: 'Your Order is Ready',
          message: 'Your order is ready for pickup/delivery!',
          color: '#28a745'
        },
        'delivered': {
          subject: 'Order Delivered Successfully',
          message: 'Your order has been delivered successfully. We hope you enjoy your fresh products!',
          color: '#2e8b57'
        },
        'cancelled': {
          subject: 'Order Cancelled',
          message: 'Your order has been cancelled. If you have any questions, please contact us.',
          color: '#dc3545'
        }
      };

      const statusInfo = statusMessages[newStatus] || statusMessages['processing'];
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@grazinacres.com',
        to: email,
        subject: `${statusInfo.subject} - Order #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${statusInfo.color}; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🌱 Grazin Acres</h1>
              <h2 style="margin: 10px 0 0 0;">Order Update</h2>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Dear ${customer},</p>
              <p>${statusInfo.message}</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: ${statusInfo.color}; margin: 0;">Order #${orderId}</h3>
                <p style="font-size: 1.2em; margin: 10px 0;"><strong>Status: ${newStatus.toUpperCase()}</strong></p>
              </div>
              
              <p>If you have any questions, please contact us at <a href="mailto:orders@grazinacres.com">orders@grazinacres.com</a>.</p>
              
              <p>Thank you for your business!</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Grazin Acres Team</strong>
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Order status update email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending order status update email:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper functions
  formatScheduleText(schedule) {
    const days = [];
    const dayNames = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    for (const [day, info] of Object.entries(schedule)) {
      if (info.enabled) {
        days.push(`${dayNames[day]}: ${info.start}-${info.end}`);
      }
    }

    return days.length > 0 ? days.join('<br>') : 'No pickup times available';
  }

  getCustomerGroupLabel(group) {
    const labels = {
      'standard': 'Standard Customer',
      'premium': 'Premium Customer',
      'business': 'Business Customer',
      'farmer': 'Farmer Network',
      'wholesale': 'Wholesale Customer'
    };
    return labels[group] || 'Standard Customer';
  }

  // Test email functionality
  async testEmailConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server is ready to send emails');
      return { success: true, message: 'Email server connection successful' };
    } catch (error) {
      console.error('Email server connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
