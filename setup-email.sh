#!/bin/bash

# Grazin Acres Email Setup Script
echo "🌱 Setting up Email Notifications for Grazin Acres..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing email dependencies..."
npm install nodemailer dotenv

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo "📝 Please edit .env file with your email credentials"
else
    echo "⚠️ .env file already exists"
fi

# Create .gitignore if it doesn't exist or add .env to it
if [ ! -f .gitignore ]; then
    echo ".env" > .gitignore
    echo "✅ Created .gitignore file"
else
    if ! grep -q "\.env" .gitignore; then
        echo ".env" >> .gitignore
        echo "✅ Added .env to .gitignore"
    fi
fi

echo ""
echo "🎉 Email setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your email credentials"
echo "2. Start the server: npm start"
echo "3. Test email: curl -X POST http://localhost:3000/admin/test-email"
echo ""
echo "📖 See EMAIL_SETUP.md for detailed instructions"
