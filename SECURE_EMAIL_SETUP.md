# 🔐 SECURE Gmail Setup Guide for Grazin Acres

## ⚠️ IMPORTANT SECURITY NOTES:
- **NEVER put real passwords directly in code files**
- **NEVER commit real credentials to version control**
- Always use environment variables for sensitive data

## Current Status: ✅ SECURE
Your system is now running securely with test email accounts.

## For Production Gmail Setup:

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Security → 2-Step Verification
3. Turn on 2-Step Verification

### Step 2: Generate App Password
1. In Google Account settings
2. Security → 2-Step Verification → App passwords
3. Select "Mail" and generate password
4. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File ONLY
**Never edit the .js files directly!**

In your `.env` file, replace:
```bash
EMAIL_USER=test@grazinacres.com
EMAIL_PASSWORD=test-password
```

With:
```bash
EMAIL_USER=calebhershberger600@gmail.com
EMAIL_PASSWORD=your-16-character-app-password-here
```

### Step 4: Switch to Gmail in Code
In `email-service.js`, line 16, change:
```javascript
// Comment out this line:
// await this.setupTestTransporter();

// Uncomment these lines:
this.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Step 5: Test
1. Restart your server
2. Go to Admin Dashboard → Settings
3. Test email connection

## Alternative: Use a Business Email
For a more professional setup, consider:
- **Gmail Workspace** (business Gmail)
- **Outlook 365** for business
- **Your hosting provider's SMTP** (most professional)

## What's Working Now:
- ✅ Secure test email system
- ✅ No credentials exposed in code
- ✅ Ready for production upgrade
- ✅ All email templates working

## Security Best Practices:
1. Always use `.env` files for credentials
2. Add `.env` to `.gitignore`
3. Use app passwords, not regular passwords
4. Consider business email services for production
