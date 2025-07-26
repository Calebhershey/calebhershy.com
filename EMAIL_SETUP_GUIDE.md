# Email Setup Guide for Grazin Acres

## Current Status: ✅ Test Email Working
Your system is currently configured with a **test email service** that works for development and testing.

**Test Email Account:** `b3toky7g4qdg7q67@ethereal.email`

## For Production Setup (Real Emails):

### Option 1: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. **Update .env file:**
   ```bash
   EMAIL_USER=yourfarm@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

4. **Update email-service.js:**
   - Comment out line 13: `await this.setupTestTransporter();`
   - Uncomment lines 15-21 (Gmail configuration)

### Option 2: Outlook/Hotmail Setup

1. **Update .env file:**
   ```bash
   EMAIL_USER=yourfarm@outlook.com
   EMAIL_PASSWORD=your-outlook-password
   ```

2. **Update email-service.js:**
   - Comment out line 13: `await this.setupTestTransporter();`
   - Uncomment lines 23-29 (Outlook configuration)

### Option 3: Custom Email Host (Best for Business)

1. **Get SMTP settings from your hosting provider**

2. **Update .env file:**
   ```bash
   EMAIL_USER=noreply@grazinacres.com
   EMAIL_PASSWORD=your-email-password
   SMTP_HOST=smtp.yourhostingprovider.com
   SMTP_PORT=587
   ```

3. **Update email-service.js:**
   - Comment out line 13: `await this.setupTestTransporter();`
   - Uncomment lines 31-39 (Custom SMTP configuration)

## Testing Your Email Setup

1. Go to Admin Dashboard → Settings
2. Click "Test Email Connection"
3. If successful, click "Send Test Email"
4. Check your inbox for the test email

## Current Features Working:
- ✅ Order confirmation emails
- ✅ Membership welcome emails  
- ✅ Admin notifications
- ✅ Order status updates
- ✅ Test email interface

## Email Templates Include:
- Professional HTML formatting
- Order details with itemized lists
- Delivery/pickup information
- Contact information and branding
- Responsive design for mobile

## Note:
The current test setup will show preview URLs in the server console where you can see how emails look without actually sending them to real inboxes.
