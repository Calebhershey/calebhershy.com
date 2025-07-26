# 📧 Email Notifications Setup Guide for Grazin Acres

## Quick Setup Instructions

### 1. Install Required Dependencies
```bash
npm install nodemailer dotenv
```

### 2. Create Environment File
1. Copy `.env.example` to `.env`
2. Update with your email credentials

### 3. Choose Your Email Provider

#### Option A: Gmail (Easiest for testing)
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an "App Password":
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
4. Update `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
ADMIN_EMAIL=admin@grazinacres.com
```

#### Option B: Outlook/Hotmail
```
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-regular-password
ADMIN_EMAIL=admin@grazinacres.com
```

#### Option C: Custom SMTP (Production Recommended)
```
EMAIL_USER=noreply@grazinacres.com
EMAIL_PASSWORD=your-email-password
SMTP_HOST=smtp.yourwebhost.com
SMTP_PORT=587
ADMIN_EMAIL=admin@grazinacres.com
```

### 4. Test Email Setup
1. Start your server: `npm start`
2. Test email functionality: 
   ```bash
   curl -X POST http://localhost:3000/admin/test-email
   ```

## 🚀 Features Included

### Automatic Emails Sent:
- ✅ **Order Confirmation** - Sent immediately when customer places order
- ✅ **Membership Welcome** - Sent when new member signs up
- ✅ **Admin Notifications** - Alerts admin of new memberships
- ✅ **Order Status Updates** - Notifies customers when order status changes

### Email Templates Include:
- Professional Grazin Acres branding
- Order details and delivery information
- Dropsite pickup instructions and schedules
- Mobile-responsive HTML design

## 📧 Email Examples

### Order Confirmation Email Contains:
- Complete order summary with items and pricing
- Delivery address OR dropsite pickup details
- Pickup schedules and contact information
- Professional farm branding

### Membership Welcome Email Contains:
- Welcome message and membership details
- Customer group information
- Links to login and start shopping
- Contact information for support

## 🔧 Admin Features

### Order Management:
- Update order status from admin dashboard
- Automatic email notifications to customers
- Status options: pending, processing, ready, delivered, cancelled

### Email Testing:
- Built-in email connection testing
- Test email sending functionality
- Error logging and debugging

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use app passwords** for Gmail (never your main password)
3. **Environment variables** for production hosting
4. **HTTPS recommended** for production email sending

## 📱 Mobile-Friendly

All email templates are responsive and look great on:
- Desktop computers
- Tablets
- Mobile phones
- Email apps

## 🔗 Integration Points

- **Checkout Process**: Automatic order confirmations
- **Admin Dashboard**: Manual status updates trigger emails
- **Member Registration**: Welcome emails and admin notifications
- **Order Management**: Status change notifications

## 📊 Email Analytics

Track email performance:
- Delivery success/failure logging
- Email service connection monitoring
- Error handling and fallback options

## 🆘 Troubleshooting

### Common Issues:

1. **Gmail "Less Secure Apps" Error**
   - Solution: Use App Password instead of regular password

2. **Outlook Authentication Failed**
   - Solution: Enable "Less secure app access" in Outlook

3. **SMTP Connection Timeout**
   - Check SMTP server settings
   - Verify firewall/port restrictions

4. **Emails Not Sending**
   - Check server logs for error messages
   - Verify environment variables are loaded
   - Test email connection endpoint

## 🎯 Production Deployment

For production hosting:
1. Use custom domain email (professional@grazinacres.com)
2. Set up SMTP through your web hosting provider
3. Configure environment variables on hosting platform
4. Enable HTTPS for secure email transmission
5. Set up email monitoring and logging

## 📞 Support

If you need help setting up email notifications:
1. Check the server console for error messages
2. Use the test email endpoint to verify configuration
3. Refer to your email provider's SMTP documentation

The email system is now fully integrated with your Grazin Acres platform!
